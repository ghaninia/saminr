<?php

namespace App\Modules\Uploads\Exceptions;

use RuntimeException;

class SettingUploadNotAllowedException extends RuntimeException
{
    public function __construct()
    {
        parent::__construct((string) __('responses.uploads.setting_no_uploads'));
    }
}
