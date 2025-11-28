<?php

namespace Drupal\fullservice_forms\Controller;

use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;

class ContactFormController extends ControllerBase
{

  public function submit(Request $request)
  {
    $data = json_decode($request->getContent(), TRUE);

    // Validate
    if (empty($data['from']) || empty($data['subject']) || empty($data['message'])) {
      return new JsonResponse(['error' => 'Missing required fields'], 400);
    }

    // Send email
    $mailManager = \Drupal::service('plugin.manager.mail');
    $module = 'fullservice_forms';
    $key = 'contact_form';
    $to = 'info@fullserviceoffice.com';
    $params['subject'] = $data['subject'];
    $params['message'] = $data['message'];
    $params['pitches'] = $data['pitches'] ?? [];
    $params['reply_to'] = $data['from']; // Set reply-to to user email

    $langcode = \Drupal::currentUser()->getPreferredLangcode();
    $from_email = 'noreply@fullserviceoffice.com'; // Must match SMTP

    $result = $mailManager->mail($module, $key, $to, $langcode, $params, $from_email);

    if ($result['result']) {
      return new JsonResponse(['success' => TRUE, 'message' => 'Email sent!']);
    }

    return new JsonResponse(['error' => 'Failed to send email'], 500);
  }
}