<?php

declare(strict_types=1);

namespace Drupal\mobile_detect\Plugin\Block;

use Detection\MobileDetect;
use Drupal\Core\Block\BlockBase;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Mobile Detect' status block for dev purposes.
 *
 * @Block(
 *   id = "mobile_detect_status_block",
 *   admin_label = @Translation("Mobile Detect Status")
 * )
 */
class MobileDetectStatusBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * Mobile detect service.
   *
   * @var \Detection\MobileDetect
   */
  protected MobileDetect $mobileDetect;

  /**
   * Creates a MobileDetectStatusBlock Block instance.
   *
   * @param array $configuration
   *   A configuration array containing information about the plugin instance.
   * @param string $plugin_id
   *   The plugin ID for the plugin instance.
   * @param mixed $plugin_definition
   *   The plugin implementation definition.
   * @param \Detection\MobileDetect $mobile_detect
   *   Mobile Detect service.
   */
  public function __construct(array $configuration, $plugin_id, $plugin_definition, MobileDetect $mobile_detect) {
    parent::__construct($configuration, $plugin_id, $plugin_definition);
    $this->mobileDetect = $mobile_detect;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    return new static(
      $configuration,
      $plugin_id,
      $plugin_definition,
      $container->get('mobile_detect')
    );
  }

  /**
   * {@inheritdoc}
   */
  public function build(): array {
    return [
      '#theme' => 'mobile_detect_status_block',
      '#version' => $this->mobileDetect->getVersion(),
    ];
  }

}
