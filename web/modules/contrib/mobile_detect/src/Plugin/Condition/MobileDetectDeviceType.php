<?php

declare(strict_types=1);

namespace Drupal\mobile_detect\Plugin\Condition;

use Detection\MobileDetect;
use Drupal\Core\Condition\ConditionPluginBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'Device type' condition.
 *
 * @Condition(
 *   id = "mobile_detect_device_type",
 *   label = @Translation("Device type"),
 * )
 */
class MobileDetectDeviceType extends ConditionPluginBase implements ContainerFactoryPluginInterface {

  /**
   * Mobile detect service.
   *
   * @var \Detection\MobileDetect
   */
  protected MobileDetect $mobileDetect;

  /**
   * {@inheritdoc}
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
  public function defaultConfiguration(): array {
    return [
      'devices' => [],
    ] + parent::defaultConfiguration();
  }

  /**
   * {@inheritdoc}
   */
  public function buildConfigurationForm(array $form, FormStateInterface $form_state): array {
    $form['devices'] = [
      '#type' => 'checkboxes',
      '#title' => $this->t('When the device is determined'),
      '#default_value' => $this->configuration['devices'],
      '#options' => [
        'phone' => $this->t('Phone'),
        'tablet' => $this->t('Tablet'),
        'desktop' => $this->t('Desktop'),
      ],
      '#description' => $this->t('If you select no devices, the condition will evaluate to TRUE for all devices.'),
    ];
    return parent::buildConfigurationForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitConfigurationForm(array &$form, FormStateInterface $form_state): void {
    parent::submitConfigurationForm($form, $form_state);
    $this->configuration['devices'] = array_filter($form_state->getValue('devices'));
  }

  /**
   * {@inheritdoc}
   */
  public function summary(): string {
    $devices = implode(', ', $this->configuration['devices']);
    return $this->isNegated()
      ? $this->t('The device is not @devices', ['@devices' => $devices])
      : $this->t('The device is @devices', ['@devices' => $devices]);
  }

  /**
   * {@inheritdoc}
   */
  public function evaluate(): bool {
    $devices = $this->configuration['devices'];
    if (empty($devices) && !$this->isNegated()) {
      return TRUE;
    }
    $detect = $this->mobileDetect;
    foreach ($devices as $device) {
      if ($device === 'phone' && $detect->isMobile() && !$detect->isTablet()) {
        return TRUE;
      }
      if ($device === 'tablet' && $detect->isTablet()) {
        return TRUE;
      }
      if ($device === 'desktop' && !$detect->isMobile()) {
        return TRUE;
      }
    }
    return FALSE;
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheContexts(): array {
    $contexts = parent::getCacheContexts();
    $contexts[] = 'mobile_detect_device_type';
    return $contexts;
  }

}
