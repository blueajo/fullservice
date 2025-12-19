<?php

namespace Drupal\media_thumbnails_video\Plugin\MediaThumbnail;

use Drupal\Core\Config\ConfigFactory;
use Drupal\Core\Entity\EntityStorageException;
use Drupal\Core\File\FileSystemInterface;
use Drupal\Core\StringTranslation\StringTranslationTrait;
use Drupal\Core\StringTranslation\TranslationInterface;
use Drupal\file\Entity\File;
use Drupal\media_thumbnails\Plugin\MediaThumbnailBase;
use FFMpeg\Coordinate\TimeCode;
use FFMpeg\Exception\ExecutableNotFoundException;
use FFMpeg\FFMpeg;
use Psr\Log\LoggerInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;
use function imagepng;

/**
 * Media thumbnail plugin for videos.
 *
 * @MediaThumbnail(
 *   id = "media_thumbnail_video",
 *   label = @Translation("Media Thumbnail Video"),
 *   mime = {
 *     "video/mp4",
 *   }
 * )
 */
class MediaThumbnailVideo extends MediaThumbnailBase {

  use StringTranslationTrait;

  /**
   * The entity manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * Constructs MediaThumbnailVideo class Object.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Drupal\Core\Config\ConfigFactory $config
   *   The config factory.
   * @param \Drupal\Core\File\FileSystemInterface $file_system
   *   The file system.
   * @param \Psr\Log\LoggerInterface $logger
   *   The logger.
   * @param \Drupal\Core\StringTranslation\TranslationInterface $string_translation
   *   The translation manager.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, ConfigFactory $config, FileSystemInterface $file_system, LoggerInterface $logger, TranslationInterface $string_translation) {
    parent::__construct($configuration, $plugin_id, $plugin_definition, $config, $file_system, $logger);
    $this->stringTranslation = $string_translation;
  }

  /**
   * Injects some default services.
   *
   * @param \Symfony\Component\DependencyInjection\ContainerInterface $container
   *   The service container.
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin_id for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   *
   * @return \Drupal\media_thumbnails\Plugin\MediaThumbnailBase
   *   The instance.
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition): MediaThumbnailBase {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('config.factory'),
      $container->get('file_system'),
      $container->get('logger.media_thumbnails'),
      $container->get('string_translation')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function createThumbnail($sourceUri) {
    $config = $this->config->get('media_thumbnails_video.settings');

    $path = $this->fileSystem->realpath($sourceUri);
    try {
      // Create ffmpeg container.
      $ffmpeg = FFMpeg::create([
        'ffmpeg.binaries' => $config->get('ffmpeg'),
        'ffprobe.binaries' => $config->get('ffprobe'),
        'timeout' => $config->get('timeout'),
        'ffmpeg.threads' => $config->get('threads'),
      ]);

      try {
        // Try open file form real path.
        $video = $ffmpeg->open($path);
        $thumbnail_path = $path . '.png';
        $width = $this->configuration['width'];

        $video->frame(TimeCode::fromSeconds(1))->save($thumbnail_path);

        if (!empty($width)) {
          $image = imagecreatefrompng($thumbnail_path);
          $image = imagescale($image, $width);
          imagepng($image, $thumbnail_path);
        }

        // Create a managed file object.
        $file = File::create([
          'uri' => $sourceUri . '.png',
          'status' => 1,
        ]);

        try {
          $file->save();
          return $file;
        }
        catch (EntityStorageException $e) {
          $this->logger->warning($this->t('Could not create thumbnail file entity.'));
          return NULL;
        }
      }
      catch (\Exception $e) {
        $this->logger->warning($e->getMessage());
        return NULL;
      }
    }
    catch (ExecutableNotFoundException $e) {
      $this->logger->warning($e->getMessage());
      return NULL;
    }
  }

}
