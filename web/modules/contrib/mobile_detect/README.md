## CONTENTS OF THIS FILE

* Introduction
* Installation
* Configuration
* Troubleshooting
* Maintainers

## INTRODUCTION

This is a lightweight mobile detection based on the Mobile_Detect.php library, which can be obtained from the GitHub repository.This module is intended to aid developers utilizing mobile-first and responsive design techniques who also have a need for slight changes for mobile and tablet users. An example would be showing (or hiding) a block or content pane to a particular device.

* For a full description of the module, visit the project page: https://drupal.org/project/mobile_detect

* To submit bug reports and feature suggestions, or to track changes: https://drupal.org/project/issues/mobile_detect


## INSTALLATION

 * Install the module using composer to download the libraries.    With Drupal 8+ the mobile_detect library is autoloaded into the vendor/ folder.

   `composer require drupal/mobile_detect`


## CONFIGURATION

 * The base module just provides a service for use in themes and other modules:
```
  $md = \Drupal::service('mobile_detect');
  $md->isMobile();
  $md->isTablet();
```
 * It adds common Twig extensions to work with html.twig templates:

```
{% if is_mobile() %}
{% if is_tablet() %}
{% if is_device('iPhone') %}
{% if is_ios() %}
{% if is_android_ios() %}
```
See the documentation for the Mobile_Detect library for more information.

Note that the Mobile_Detect considers tablet devices as also being mobile devices. When you have both tablet and mobile device selection in use, it is best to place he tablet rules first. For example, when using with for Panel page selection rules, place the Table variant before the Mobile variant.


## TROUBLESHOOTING

 * Problems with the actual Mobile_Detect library should be directed to the GitHub issue queue.
 * Problems with this module and sub-modules should be directed to the Drupal issue queue for this project.
 * The "Internal Page Cache" core module assumes that all pages served to anonymous users will be identical, regardless of the implementation  of cache contexts.

    If you want to use the mobile_detect cache contexts to vary the content
    served to anonymous users, "Internal Page Cache" must be disabled,
    and the performance impact that entails incurred.

  * https://www.drupal.org/docs/drupal-apis/cache-api/cache-contexts
