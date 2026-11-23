<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include("header.php"); ?>
<body>
    <?php
    include("navbar.php");
    if (!isset($_SESSION["user_id"])) {
        echo '<script>
            Swal.fire({
                title: "คุณยังไม่ได้เข้าสู่ระบบ",
                icon: "warning",
                confirmButtonColor: "#136F73",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "login.php";
            });
        </script>';
        exit();
    } elseif (($_SESSION["role"] ?? '') !== 'admin' && ($_SESSION["role"] ?? '') !== 'teacher') {
        echo '<script>
            Swal.fire({
                title: "คุณไม่มีสิทธิเข้าถึง!",
                icon: "warning",
                confirmButtonColor: "#136F73",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "index.php";
            });
        </script>';
        exit();
    }
    ?>

    <main class="container my-5 flex-grow-1">
        <div class="mx-auto" style="max-width: 580px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white" style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-user-plus me-2"></i>ระบบเพิ่มสมาชิกใหม่</h1>
                    <p class="small opacity-75 mb-0">รหัสผ่านเริ่มต้นจะถูกตั้งค่าให้ตรงกับรหัสประจำตัวของผู้ใช้</p>
                </div>

                <form class="p-4" action="php/add-member.php" name="addwp" method="POST">
                    <div class="mb-3">
                        <label for="username" class="form-label fw-semibold small">รหัสประจำตัว / ชื่อผู้ใช้</label>
                        <input class="form-control" type="text" name="username" id="username" placeholder="เช่น รหัสนักศึกษา 65xxxx หรือชื่อผู้ใช้" required>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label for="user_fname" class="form-label fw-semibold small">ชื่อจริง</label>
                            <input class="form-control" type="text" name="user_fname" id="user_fname" required>
                        </div>
                        <div class="col-md-6">
                            <label for="user_lname" class="form-label fw-semibold small">นามสกุล</label>
                            <input class="form-control" type="text" name="user_lname" id="user_lname" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="user_tel" class="form-label fw-semibold small">เบอร์โทรศัพท์</label>
                        <input type="text" class="form-control" name="user_tel" id="user_tel" required>
                    </div>

                    <div class="mb-4">
                        <label for="user_type" class="form-label fw-semibold small">ประเภทบัญชี</label>
                        <select class="form-select" name="user_type" id="user_type">
                            <option value="student">นักเรียน / นักศึกษา</option>
                            <option value="teacher">ครู / อาจารย์</option>
                            <?php if (($_SESSION['role'] ?? '') === 'admin'): ?>
                                <option value="admin">ผู้ดูแลระบบ</option>
                            <?php endif; ?>
                        </select>
                    </div>

                    <div class="d-grid gap-2">
                        <button class="btn btn-ssp-primary py-2 fw-semibold" type="submit" name="submit" value="Submit">
                            <i class="fa-solid fa-user-plus me-1"></i> เพิ่มสมาชิก
                        </button>
                        <a href="admin-users-manage.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <?php include 'script.php'; ?>
</body>
</html>
