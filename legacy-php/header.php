<?php
require_once __DIR__ . '/connection.php';
?>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ระบบรวบรวมสถานประกอบการ แผนกเทคโนโลยีสารสนเทศ | วิทยาลัยเทคนิคหาดใหญ่</title>
    <link rel="icon" href="img/logo_ithtc.png" type="image/x-icon">
    <link href="css/bootstrap.min.css" rel="stylesheet">
    <link href="css/select2.min.css" rel="stylesheet">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <script src="js/sweetalert10.16.0.js"></script>
    <script src="js/fontawesome.js" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="mycss/custom.css">
</head>

<header class="ssp-topbar">
    <div class="container d-flex flex-wrap justify-content-between align-items-center gap-2">
        <a href="index.php" class="ssp-brand">
            <img src="img/logo_ithtc.png" alt="IT HTC Logo" class="ssp-brand-logo" onerror="this.style.display='none'">
            <div>
                <p class="ssp-brand-title">ระบบรวบรวมสถานประกอบการฝึกงาน</p>
                <p class="ssp-brand-subtitle">แผนกเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่ (HTC Internship Portal)</p>
            </div>
        </a>

        <div class="d-flex align-items-center gap-2">
            <?php if (isset($_SESSION['user_id'])):
                $fname = $_SESSION['nowuser_fname'] ?? '';
                $lname = $_SESSION['nowuser_lname'] ?? '';
                $role  = $_SESSION['role'] ?? 'student';
                $initial = mb_substr($fname !== '' ? $fname : $_SESSION['user_id'], 0, 1, 'UTF-8');
            ?>
                <a href="profile.php" class="ssp-user-pill" title="แก้ไขข้อมูลส่วนตัว">
                    <span class="ssp-user-avatar"><?php echo e($initial); ?></span>
                    <span class="fw-medium"><?php echo e(trim($fname . ' ' . $lname) ?: $_SESSION['user_id']); ?></span>
                    <span class="ssp-role-tag"><?php echo e(getRoleLabel($role)); ?></span>
                </a>
            <?php else: ?>
                <span class="badge rounded-pill bg-light text-dark px-3 py-2 fw-normal d-none d-md-inline-flex align-items-center gap-2">
                    <i class="fa-solid fa-graduation-cap text-teal" style="color: var(--ssp-primary);"></i>
                    สำหรับนักเรียน นักศึกษา ฝึกประสบการณ์วิชาชีพ
                </span>
            <?php endif; ?>
        </div>
    </div>
</header>
