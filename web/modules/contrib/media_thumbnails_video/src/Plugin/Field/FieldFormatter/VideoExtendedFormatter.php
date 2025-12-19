<?php

namespace Drupal\media_thumbnails_video\Plugin\Field\FieldFormatter;

use Drupal\Core\Entity\EntityInterface;
use Drupal\Core\Field\FieldDefinitionInterface;
use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\File\FileUrlGeneratorInterface;
use Drupal\file\Plugin\Field\FieldFormatter\FileVideoFormatter;
use Drupal\media\MediaInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Plugin implementation of the 'file_video' formatter.
 *
 * @FieldFormatter(
 *   id = "file_video_extended",
 *   label = @Translation("Video extended"),
 *   description = @Translation("Display the file using an HTML5 video tag."),
 *   field_types = {
 *     "file"
 *   }
 * )
 */
class VideoExtendedFormatter extends FileVideoFormatter {

  /**
   * FIle url generator.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * {@inheritdoc}
   */
  public function __construct($plugin_id, $plugin_definition, FieldDefinitionInterface $field_definition, array $settings, $label, $view_mode, array $third_party_settings, FileUrlGeneratorInterface $fileUrlGenerator) {
    parent::__construct($plugin_id, $plugin_definition, $field_definition, $settings, $label, $view_mode, $third_party_settings);
    $this->fileUrlGenerator = $fileUrlGenerator;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static($plugin_id, $plugin_definition, $configuration['field_definition'], $configuration['settings'], $configuration['label'], $configuration['view_mode'], $configuration['third_party_settings'], $container->get('file_url_generator'));
  }

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {
    $elements = parent::viewElements($items, $langcode);
    foreach ($elements as $key => $element) {
      $attributes = $this->prepareAttributes();
      $item = $items[$key];
      $source_entity = $item->getEntity();
      $poster = $this->getPoster($source_entity);
      if ($poster) {
        $attributes->setAttribute('poster', $poster);
      }

      $elements[$key]['#theme'] = 'file_video';
      $elements[$key]['#attributes'] = $attributes;
    }

    return $elements;
  }

  /**
   * Get poster.
   *
   * @param \Drupal\Core\Entity\EntityInterface $entity
   *   Entity object.
   *
   * @return bool|string
   *   Url to poster or false.
   */
  protected function getPoster(EntityInterface $entity) {
    if ($entity instanceof MediaInterface) {
      $thumbnail = $entity->get('thumbnail')->entity;
      if ($thumbnail) {
        return $this->fileUrlGenerator->generateAbsoluteString($thumbnail->getFileUri());
      }
    }

    return FALSE;
  }

}
