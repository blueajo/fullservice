<?php

namespace Drupal\fullservice_forms\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ContactFormController extends ControllerBase {

  public function submit(Request $request) {
    $data = json_decode($request->getContent(), TRUE);
    
    // Validate
    if (empty($data['from']) || empty($data['subject']) || empty($data['message'])) {
      return new JsonResponse(['error' => 'Missing required fields'], 400);
    }
    
    // Send email
    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'fullservice_forms';
    $key = 'contact_form';
    $to = \Drupal::config('system.site')->get('mail') ?: 'info@fullserviceoffice.com';
    $params['message'] = $data['message'];
    $params['from'] = $data['from'];
    $params['subject'] = $data['subject'];
    $params['pitches'] = $data['pitches'] ?? [];
    $langcode = \Drupal::currentUser()->getPreferredLangcode();
    
    $result = $mailManager->mail($module, $key, $to, $langcode, $params, $data['from']);
    
    if ($result['result']) {
      return new JsonResponse(['success' => TRUE, 'message' => 'Email sent!']);
    }
    
    return new JsonResponse(['error' => 'Failed to send email'], 500);
  }
}
