<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include("header.php"); ?>
<body>
    <?php include("navbar.php"); ?>

    <?php if (isset($_SESSION["user_id"])): ?>
        <script>
            Swal.fire('คุณได้เข้าสู่ระบบแล้ว!', '', 'success').then(function() {
                window.location.href = 'index.php';
            });
        </script>
    <?php else: ?>
        <main class="container my-5 flex-grow-1 d-flex align-items-center justify-content-center">
            <div class="ssp-card overflow-hidden" style="max-width: 880px; width: 100%;">
                <div class="row g-0">
                    <!-- Left Brand Panel -->
                    <div class="col-md-5 d-none d-md-flex flex-column justify-content-between p-4 text-white"
                         style="background: linear-gradient(145deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                        <div>
                            <span class="badge rounded-pill px-3 py-1 mb-3" style="background: rgba(255, 183, 43, 0.25); color: #FFB72B;">
                                HTC Internship System
                            </span>
                            <h2 class="h4 fw-bold mb-2">ยินดีต้อนรับสู่ระบบสถานประกอบการ</h2>
                            <p class="small opacity-75 mb-0">
                                สำหรับนักเรียน นักศึกษา อาจารย์ และผู้ดูแลระบบ แผนกวิชาเทคโนโลยีสารสนเทศ วิทยาลัยเทคนิคหาดใหญ่
                            </p>
                        </div>
                        <div class="my-3 text-center">
                            <img src="img/login_banner.png" alt="Login Banner" class="img-fluid rounded shadow-sm" style="max-height: 170px; object-fit: cover;">
                        </div>
                        <div class="small opacity-75">
                            <i class="fa-solid fa-shield-halved me-1"></i> เข้าสู่ระบบด้วยรหัสประจำตัวนักเรียนหรือชื่อผู้ใช้
                        </div>
                    </div>

                    <!-- Right Login Form -->
                    <div class="col-md-7 p-4 p-lg-5 bg-white">
                        <div class="mb-4">
                            <h1 class="h4 fw-bold mb-1" style="color: var(--ssp-primary);">เข้าสู่ระบบ (Sign In)</h1>
                            <p class="text-secondary small mb-0">กรอกชื่อบัญชีผู้ใช้และรหัสผ่านของคุณเพื่อเข้าใช้งาน</p>
                        </div>

                        <form name="form1" method="post" action="check_login.php">
                            <div class="mb-3">
                                <label for="username" class="form-label fw-semibold small">ชื่อบัญชีผู้ใช้ / รหัสประจำตัว</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light"><i class="fa-solid fa-user text-secondary"></i></span>
                                    <input type="text" class="form-control" name="username" id="username" placeholder="กรอกรหัสผู้ใช้ หรือ Username" required autofocus>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label for="password" class="form-label fw-semibold small">รหัสผ่าน</label>
                                <div class="input-group">
                                    <span class="input-group-text bg-light"><i class="fa-solid fa-lock text-secondary"></i></span>
                                    <input type="password" class="form-control" name="password" id="password" placeholder="กรอกรหัสผ่าน" required>
                                </div>
                            </div>

                            <div class="d-grid gap-2">
                                <button type="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                    <i class="fa-solid fa-right-to-bracket me-1"></i> เข้าสู่ระบบ
                                </button>
                                <a href="index.php" class="btn btn-outline-secondary py-2">
                                    ยกเลิกและกลับหน้าแรก
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </main>
        <?php include 'script.php'; ?>
    <?php endif; ?>

    <script>
        addClassToElement("login");
    </script>
</body>
</html>
