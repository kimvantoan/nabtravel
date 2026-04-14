<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'slug',
        'content',
        'meta_description',
        'thumbnail_url',
        'hotel_ids',
        'status',
        'is_ai_generated',
        'author_name',
    ];

    protected static function booted()
    {
        static::creating(function ($article) {
            if (empty($article->author_name)) {
                $ho = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Huỳnh', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý'];
                $dem = ['Thị', 'Văn', 'Hữu', 'Ngọc', 'Thanh', 'Minh', 'Đức', 'Xuân', 'Thu', 'Hoài', 'Gia', 'Bảo', 'Quốc', 'Tuấn', 'Hồng'];
                $ten = ['Anh', 'Bình', 'Châu', 'Cường', 'Dương', 'Dung', 'Hà', 'Hải', 'Hiếu', 'Hòa', 'Lan', 'Linh', 'Mai', 'Nam', 'Nga', 'Phong', 'Phương', 'Quang', 'Sơn', 'Trang', 'Tùng', 'Tuấn', 'Yến', 'Vy', 'My', 'Lộc', 'Phát', 'Tài'];
                
                $article->author_name = $ho[array_rand($ho)] . ' ' . $dem[array_rand($dem)] . ' ' . $ten[array_rand($ten)];
            }
        });
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'hotel_ids' => 'json',
        ];
    }
}
