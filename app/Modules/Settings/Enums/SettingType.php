<?php

namespace App\Modules\Settings\Enums;

enum SettingType: string
{
    case SINGLE = 'single';
    case MULTIPLE = 'multiple';
    case IMAGE = 'image';
    case TEXT = 'text';
    case RICH_TEXT = 'rich_text';
    case LINK = 'link';
    case FILE = 'file';
    case NUMBER = 'number';
    case EMAIL = 'email';
    case WEBSITE = 'website';
    case ARRAY = 'array';
}
