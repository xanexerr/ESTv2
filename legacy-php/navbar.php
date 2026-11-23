<?php
require_once __DIR__ . '/connection.php';

if (isset($_SESSION['user_id'])) {
    $user_id = $_SESSION['user_id'];
    try {
        $stmt = $conn->prepare("SELECT user_id, user_fname, user_lname, workplace_id, role FROM users WHERE user_id = :uid LIMIT 1");
        $stmt->execute([':uid' => $user_id]);
        $uRow = $stmt->fetch();
        if ($uRow) {
            $_SESSION['nowuser_fname'] = $uRow['user_fname'];
            $_SESSION['nowuser_lname'] = $uRow['user_lname'];
            $_SESSION['role']          = $uRow['role'];
            $workplace_id              = $uRow['workplace_id'];
            $nowuser_fname             = $uRow['user_fname'];
            $nowuser_lname             = $uRow['user_lname'];
            $role                      = $uRow['role'];
            $nowwp_id                  = $uRow['workplace_id'];
        }
    } catch (Exception $e) {
        // Ignore silent lookup error
    }
}
?>
<nav class="navbar navbar-expand-lg ssp-navbar">
    <div class="container">
        <button class="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
            aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <i class="fa-solid fa-bars fs-5" style="color: var(--ssp-primary);"></i>
        </button>

        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav me-auto align-items-lg-center">
                <li class="nav-item">
                    <a class="nav-link ssp-nav-link" id="index" href="index.php">
                        <i class="fa-solid fa-compass"></i> หน้าแรก
                    </a>
                </li>

                <?php if (isset($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'admin'): ?>
                    <li class="nav-item">
                        <a class="nav-link ssp-nav-link" id="amanage" href="admin-users-manage.php">
                            <i class="fa-solid fa-users-gear"></i> จัดการบัญชีผู้ใช้
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ssp-nav-link" id="wmanage" href="admin-wp.php">
                            <i class="fa-solid fa-building-circle-check"></i> จัดการสถานประกอบการ
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link ssp-nav-link" id="cmtmanage" href="admin-comment.php">
                            <i class="fa-solid fa-comments"></i> จัดการความคิดเห็น
                        </a>
                    </li>
                <?php endif; ?>

                <?php if (isset($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'teacher'): ?>
                    <li class="nav-item">
                        <a class="nav-link ssp-nav-link" id="tmanage" href="teacher-wp.php">
                            <i class="fa-solid fa-briefcase"></i> จัดการสถานประกอบการของฉัน
                        </a>
                    </li>
                <?php endif; ?>

                <?php if (isset($_SESSION['user_id']) && ($_SESSION['role'] ?? '') === 'student'): ?>
                    <li class="nav-item">
                        <a class="nav-link ssp-nav-link" id="std-edit" href="std-wp-edit.php">
                            <i class="fa-solid fa-building-user"></i> สถานประกอบการของคุณ
                        </a>
                    </li>
                <?php endif; ?>

                <li class="nav-item">
                    <a class="nav-link ssp-nav-link" id="about" href="about.php">
                        <i class="fa-solid fa-headset"></i> ติดต่อแอดมิน
                    </a>
                </li>
            </ul>

            <ul class="navbar-nav ms-auto align-items-lg-center gap-2 mt-2 mt-lg-0">
                <?php if (isset($_SESSION['user_id'])): ?>
                    <li class="nav-item">
                        <a class="nav-link ssp-nav-link" id="profile" href="profile.php">
                            <i class="fa-solid fa-user-pen"></i> ข้อมูลส่วนตัว
                        </a>
                    </li>
                    <li class="nav-item">
                        <a class="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-medium d-inline-flex align-items-center gap-1" href="logout.php">
                            <i class="fa-solid fa-right-from-bracket"></i> ออกจากระบบ
                        </a>
                    </li>
                <?php else: ?>
                    <li class="nav-item">
                        <a href="login.php" id="login" class="btn btn-ssp-primary rounded-pill px-4 py-1 d-inline-flex align-items-center gap-2">
                            <i class="fa-solid fa-right-to-bracket"></i> เข้าสู่ระบบ
                        </a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>
