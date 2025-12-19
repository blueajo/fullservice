<?php

namespace Drupal\media_thumbnails_video\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * The MediaThumbnailsVideoSettingsForm Configuration Class.
 */
class MediaThumbnailsVideoSettingsForm extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'media_thumbnails_video_settings';
  }

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return ['media_thumbnails_video.settings'];
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $form['ffmpeg'] = [
      '#type' => 'textfield',
      '#title' => $this->t('FFmpeg binary path'),
      '#default_value' => $this->config('media_thumbnails_video.settings')->get('ffmpeg'),
    ];

    $form['ffprobe'] = [
      '#type' => 'textfield',
      '#title' => $this->t('FFprobe binary path'),
      '#default_value' => $this->config('media_thumbnails_video.settings')->get('ffprobe'),
    ];

    $form['timeout'] = [
      '#type' => 'number',
      '#title' => $this->t('Timeout'),
      '#default_value' => $this->config('media_thumbnails_video.settings')->get('timeout'),
      '#min' => 100,
      '#step' => 100,
    ];

    $form['threads'] = [
      '#type' => 'number',
      '#title' => $this->t('Threads'),
      '#default_value' => $this->config('media_thumbnails_video.settings')->get('threads'),
      '#min' => 1,
    ];

    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    $this->config('media_thumbnails_video.settings')
      ->set('ffmpeg', $form_state->getValue('ffmpeg'))
      ->set('ffprobe', $form_state->getValue('ffprobe'))
      ->set('timeout', $form_state->getValue('timeout'))
      ->set('threads', $form_state->getValue('threads'))
      ->save();
    parent::submitForm($form, $form_state);
  }

}
