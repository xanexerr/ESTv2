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
    $workTypes = getWorkTypes();
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 680px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white" style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-building-circle-plus me-2"></i>เพิ่มสถานประกอบการ</h1>
                    <p class="small opacity-75 mb-0">บันทึกข้อมูลสถานประกอบการใหม่สำหรับนักศึกษาฝึกงาน</p>
                </div>

                <form class="p-4" action="php/teacher-add-wp.php" name="addwp" method="POST">
                    <input type="hidden" name="user_id" id="user_id" required value="<?php echo e($_SESSION["user_id"]); ?>">

                    <div class="mb-3">
                        <label for="wp_name" class="form-label fw-semibold small">ชื่อสถานประกอบการ</label>
                        <input class="form-control" type="text" name="wp_name" id="wp_name" required>
                    </div>

                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label for="work_type" class="form-label fw-semibold small">ประเภทงาน</label>
                            <select class="form-select" name="work_type" id="work_type">
                                <?php foreach ($workTypes as $typeKey => $meta): ?>
                                    <option value="<?php echo e($typeKey); ?>"><?php echo e($meta['label']); ?></option>
                                <?php endforeach; ?>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>
                        <div class="col-md-6">
                            <label for="wp_tel" class="form-label fw-semibold small">เบอร์โทรติดต่อ</label>
                            <input class="form-control" type="text" name="wp_tel" id="wp_tel" required>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="wp_des" class="form-label fw-semibold small">ลักษณะงาน</label>
                        <input class="form-control" type="text" name="wp_des" id="wp_des">
                    </div>

                    <div class="mb-3">
                        <label for="wp_address" class="form-label fw-semibold small">ที่อยู่</label>
                        <textarea class="form-control" name="wp_address" id="wp_address" rows="3" required></textarea>
                    </div>

                    <div class="mb-4">
                        <label for="map" class="form-label fw-semibold small">แผนที่ (Google Maps URL)</label>
                        <input type="url" class="form-control" name="map" id="map" placeholder="https://maps.google.com/...">
                    </div>

                    <div class="d-grid gap-2">
                        <button class="btn btn-ssp-primary py-2 fw-semibold" type="submit" name="submit" value="Submit">
                            <i class="fa-solid fa-circle-plus me-1"></i> เพิ่มสถานประกอบการ
                        </button>
                        <a href="teacher-wp.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
                    </div>
                </form>
            </div>
        </div>
    </main>

    <?php include("script.php"); ?>
</body>
</html>
