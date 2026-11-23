<?php
/**
 * Core Database Connection & Helper Utilities
 * EstV2 / HTC-Est-For-Internship (Modernized)
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$server   = "localhost";
$username = "root";
$password = "";
$database = "tryproject2";

// 1. MySQLi Connection (kept open for legacy compatibility)
$connection = new mysqli($server, $username, $password, $database);
if ($connection->connect_error) {
    die("Connection failed: " . $connection->connect_error);
}
$connection->set_charset("utf8mb4");

// 2. PDO Connection (primary database driver)
try {
    $conn = new PDO(
        "mysql:host=$server;dbname=$database;charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}

if (!defined('ESTV2_HELPERS_LOADED')) {
    define('ESTV2_HELPERS_LOADED', true);

    /**
     * Escape HTML entities safely
     */
    function e($value): string
    {
        return htmlspecialchars((string)($value ?? ''), ENT_QUOTES, 'UTF-8');
    }

    /**
     * Get standard work type categories with metadata (icon, badge class, color)
     */
    function getWorkTypes(): array
    {
        return [
            'เขียนโปรแกรม' => [
                'label' => 'เขียนโปรแกรม',
                'icon'  => 'fa-solid fa-code',
                'color' => '#136F73',
                'bg'    => 'rgba(19, 111, 115, 0.12)',
            ],
            'ทำกราฟิก' => [
                'label' => 'ทำกราฟิก',
                'icon'  => 'fa-solid fa-palette',
                'color' => '#D97706',
                'bg'    => 'rgba(245, 158, 11, 0.14)',
            ],
            'ระบบเครือข่าย' => [
                'label' => 'ระบบเครือข่าย',
                'icon'  => 'fa-solid fa-network-wired',
                'color' => '#2563EB',
                'bg'    => 'rgba(37, 99, 235, 0.12)',
            ],
            'ทำเว็บไซต์' => [
                'label' => 'ทำเว็บไซต์',
                'icon'  => 'fa-solid fa-globe',
                'color' => '#0891B2',
                'bg'    => 'rgba(8, 145, 178, 0.12)',
            ],
            'ด้านบริการ' => [
                'label' => 'ด้านบริการ',
                'icon'  => 'fa-solid fa-headset',
                'color' => '#7C3AED',
                'bg'    => 'rgba(124, 58, 237, 0.12)',
            ],
        ];
    }

    /**
     * Get metadata for a given work type
     */
    function getWorkTypeMeta(?string $type): array
    {
        $types = getWorkTypes();
        $clean = trim((string)$type);
        if (isset($types[$clean])) {
            return $types[$clean];
        }
        return [
            'label' => $clean !== '' ? $clean : 'อื่นๆ',
            'icon'  => 'fa-solid fa-building',
            'color' => '#475569',
            'bg'    => 'rgba(71, 85, 105, 0.12)',
        ];
    }

    /**
     * Render HTML stars for a numeric rating (0-5)
     */
    function renderStarRating($rating, string $sizeClass = ''): string
    {
        $val = is_numeric($rating) ? (float)$rating : 0.0;
        $html = '<span class="ssp-stars ' . e($sizeClass) . '" title="' . number_format($val, 1) . ' / 5.0">';
        for ($i = 1; $i <= 5; $i++) {
            $diff = $val - $i + 1;
            if ($diff >= 0.75) {
                $html .= '<i class="fa-solid fa-star"></i>';
            } elseif ($diff >= 0.25) {
                $html .= '<i class="fa-solid fa-star-half-stroke"></i>';
            } else {
                $html .= '<i class="fa-regular fa-star empty"></i>';
            }
        }
        $html .= '</span>';
        return $html;
    }

    /**
     * Normalize stored comment image path to a web-accessible relative path from root
     */
    function normalizeCommentImagePath(?string $imgPath): ?string
    {
        if ($imgPath === null) {
            return null;
        }
        $clean = trim($imgPath);
        if ($clean === '') {
            return null;
        }
        // Strip leading ../ or ./ or img/
        $clean = preg_replace('#^(\.\./|\./)+#', '', $clean);
        if (strpos($clean, 'img/') === 0) {
            return $clean;
        }
        return 'img/' . ltrim($clean, '/');
    }

    /**
     * Recalculate a workplace's average rating based on visible comments
     */
    function recalculateWorkplaceRating(PDO $conn, $workplaceId): float
    {
        $stmt = $conn->prepare("SELECT AVG(rating) FROM comments WHERE workplace_id = :wid AND `show` = 1 AND rating > 0");
        $stmt->execute([':wid' => $workplaceId]);
        $avg = $stmt->fetchColumn();
        $newRating = $avg !== null && $avg !== false ? round((float)$avg, 1) : 0.0;

        $upd = $conn->prepare("UPDATE workplaces SET rating = :rating WHERE workplace_id = :wid");
        $upd->execute([
            ':rating' => $newRating,
            ':wid'    => $workplaceId,
        ]);
        return $newRating;
    }

    /**
     * Role label in Thai
     */
    function getRoleLabel(?string $role): string
    {
        switch ($role) {
            case 'admin':
                return 'ผู้ดูแลระบบ';
            case 'teacher':
                return 'ครู / อาจารย์';
            case 'student':
                return 'นักเรียน / นักศึกษา';
            default:
                return 'ผู้ใช้งานทั่วไป';
        }
    }
}
