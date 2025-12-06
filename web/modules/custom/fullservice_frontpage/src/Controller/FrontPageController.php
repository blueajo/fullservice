<?php

namespace Drupal\fullservice_frontpage\Controller;

use Drupal\Core\Controller\ControllerBase;

class FrontPageController extends ControllerBase
{

    public function content()
    {
        // Return empty render array - your template handles everything
        return [
            '#markup' => '',
        ];
    }

}