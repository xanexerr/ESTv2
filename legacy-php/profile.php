<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include 'header.php'; ?>
<body>
    <?php include 'navbar.php'; ?>

    <?php
    if (!isset($_SESSION['user_id'])) {
        echo '<script>
            Swal.fire({
                title: "คุณยังไม่ได้เข้าสู่ระบบ",
                icon: "warning",
                confirmButtonText: "ตกลง"
            }).then(() => {
                window.location.href = "login.php";
            });
        </script>';
        exit();
    }

    $session_userid = $_SESSION['user_id'];
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = :session_userid LIMIT 1");
    $stmt->bindParam(':session_userid', $session_userid, PDO::PARAM_STR);
    $stmt->execute();
    $userData = $stmt->fetchAll();
    ?>

    <main class="container my-5 flex-grow-1">
        <div class="mx-auto" style="max-width: 600px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white d-flex align-items-center gap-3"
                     style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <div class="ssp-user-avatar" style="width: 52px; height: 52px; font-size: 1.25rem;">
                        <?php echo e(mb_substr($_SESSION['nowuser_fname'] ?? $session_userid, 0, 1, 'UTF-8')); ?>
                    </div>
                    <div>
                        <h1 class="h5 fw-bold mb-0">แก้ไขข้อมูลส่วนตัว</h1>
                        <p class="small opacity-75 mb-0">สถานะบัญชี : <?php echo e(getRoleLabel($_SESSION['role'] ?? '')); ?></p>
                    </div>
                </div>

                <?php foreach ($userData as $row): ?>
                    <form class="p-4" name="edit_workplace_form" method="POST" action="php/profileupdate.php" enctype="multipart/form-data">
                        <div class="mb-3">
                            <label for="user_id" class="form-label fw-semibold small">รหัสผู้ใช้ (ไม่สามารถแก้ไขได้)</label>
                            <input type="text" class="form-control bg-light text-secondary fw-semibold" name="user_id"
                                value="<?php echo e($row['user_id']); ?>" readonly>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="user_fname" class="form-label fw-semibold small">ชื่อ</label>
                                <input type="text" class="form-control" name="user_fname" value="<?php echo e($row['user_fname']); ?>" required>
                            </div>
                            <div class="col-md-6">
                                <label for="user_lname" class="form-label fw-semibold small">นามสกุล</label>
                                <input type="text" class="form-control" name="user_lname" value="<?php echo e($row['user_lname']); ?>" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="user_tel" class="form-label fw-semibold small">เบอร์โทรศัพท์</label>
                            <input type="text" class="form-control" name="user_tel" value="<?php echo e($row['user_tel']); ?>" required>
                        </div>

                        <div class="mb-4">
                            <label for="passwordField" class="form-label fw-semibold small">รหัสผ่าน</label>
                            <div class="input-group">
                                <input type="password" class="form-control" name="password" id="passwordField"
                                    value="<?php echo e($row['password']); ?>" required>
                                <button class="btn btn-outline-secondary px-3" type="button" id="showPasswordBtn"></button>
                            </div>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" value="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-floppy-disk me-1"></i> บันทึกการเปลี่ยนแปลง
                            </button>
                            <a href="<?php echo (($_SESSION['role'] ?? '') === 'admin') ? 'admin-users-manage.php' : 'index.php'; ?>"
                               class="btn btn-outline-secondary py-2">
                                ยกเลิก
                            </a>
                        </div>
                    </form>
                <?php endforeach; ?>
            </div>
        </div>
    </main>

    <?php include 'script.php'; ?>
    <script>
        addClassToElement("profile");

        document.addEventListener('DOMContentLoaded', function () {
            const passwordField = document.getElementById('passwordField');
            const showPasswordBtn = document.getElementById('showPasswordBtn');
            if (!passwordField || !showPasswordBtn) return;

            function updateButtonText() {
                if (passwordField.getAttribute('type') === 'password') {
                    showPasswordBtn.innerHTML = '<i class="fa-regular fa-eye me-1"></i> แสดง';
                } else {
                    showPasswordBtn.innerHTML = '<i class="fa-regular fa-eye-slash me-1"></i> ซ่อน';
                }
            }

            updateButtonText();
            showPasswordBtn.addEventListener('click', function () {
                const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
                passwordField.setAttribute('type', type);
                updateButtonText();
            });
        });
    </script>
</body>
</html>
