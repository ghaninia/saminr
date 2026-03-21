<?php

namespace App\Modules\Settings\Enums;

enum SettingType: string
{
    case SINGLE = 'single';
    case MULTIPLE = 'multiple';
    case IMAGE = 'image';
    case TEXT = 'text';
    case RICH_TEXT = 'rich_text';
}
