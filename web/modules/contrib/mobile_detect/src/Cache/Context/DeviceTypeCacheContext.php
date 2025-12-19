<?php

declare(strict_types=1);

namespace Drupal\mobile_detect\Cache\Context;

use Detection\MobileDetect;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\Context\CacheContextInterface;

/**
 * Defines the 'Device type' cache context.
 *
 * Cache context ID: 'mobile_detect_device_type'.
 */
class DeviceTypeCacheContext implements CacheContextInterface {

  /**
   * Mobile Detect object.
   *
   * @var \Detection\MobileDetect
   */
  protected MobileDetect $mobileDetect;

  /**
   * Constructs an IsFrontPathCacheContext object.
   *
   * @param \Detection\MobileDetect $mobile_detect
   *   Mobile Detect object.
   */
  public function __construct(MobileDetect $mobile_detect) {
    $this->mobileDetect = $mobile_detect;
  }

  /**
   * {@inheritdoc}
   */
  public static function getLabel(): string {
    return 'Device type';
  }

  /**
   * {@inheritdoc}
   */
  public function getContext(): string {
    $detect = $this->mobileDetect;
    if ($detect->isTablet()) {
      return 'tablet';
    }
    else {
      if ($detect->isMobile()) {
        return 'phone';
      }
      else {
        return 'desktop';
      }
    }
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata(): CacheableMetadata {
    return new CacheableMetadata();
  }

}
