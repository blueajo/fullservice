<?php

declare(strict_types=1);

namespace Drupal\mobile_detect\Cache\Context;

use Detection\MobileDetect;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\Context\CacheContextInterface;

/**
 * Defines the 'Platform' cache context.
 *
 * Cache context ID: 'mobile_detect_platform'.
 */
class PlatformCacheContext implements CacheContextInterface {

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
    return 'Platform';
  }

  /**
   * {@inheritdoc}
   */
  public function getContext(): string {
    $detect = $this->mobileDetect;
    if ($detect->isAndroidOS()) {
      return 'android';
    }
    elseif ($detect->isiOS()) {
      return 'ios';
    }
    return 'other';
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata(): CacheableMetadata {
    return new CacheableMetadata();
  }

}
