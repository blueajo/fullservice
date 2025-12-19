<?php

declare(strict_types=1);

namespace Drupal\mobile_detect\Cache\Context;

use Detection\MobileDetect;
use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Cache\Context\CacheContextInterface;

/**
 * Defines the 'Is mobile' cache context.
 *
 * Cache context ID: 'mobile_detect_is_mobile'.
 */
class IsMobileCacheContext implements CacheContextInterface {

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
    return 'Is mobile';
  }

  /**
   * {@inheritdoc}
   */
  public function getContext(): string {
    return (string) $this->mobileDetect->isMobile();
  }

  /**
   * {@inheritdoc}
   */
  public function getCacheableMetadata(): CacheableMetadata {
    return new CacheableMetadata();
  }

}
