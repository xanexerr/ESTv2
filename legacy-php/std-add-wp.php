<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include 'header.php'; ?>
<?php
if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $workplace_name    = trim($_POST["workplace_name"] ?? '');
    $workplace_address = trim($_POST["workplace_address"] ?? '');
    $work_type         = trim($_POST["work_type"] ?? '');
    $work_des          = trim($_POST["work_des"] ?? '');
    $work_tel          = trim($_POST["workplace_tel"] ?? '');
    $map               = trim($_POST["map"] ?? '');
    $user_id           = $_SESSION["user_id"] ?? '';

    $stmt = $conn->prepare("
        INSERT INTO workplaces (workplace_name, workplace_address, work_type, description, work_tel, map, user_id, rating, `show`)
        VALUES (:wname, :waddr, :wtype, :wdes, :wtel, :wmap, :uid, '0', 1)
    ");

    if ($stmt->execute([
        ':wname' => $workplace_name,
        ':waddr' => $workplace_address,
        ':wtype' => $work_type,
        ':wdes'  => $work_des,
        ':wtel'  => $work_tel,
        ':wmap'  => $map,
        ':uid'   => $user_id,
    ])) {
        $newWpId = $conn->lastInsertId();
        $updUser = $conn->prepare("UPDATE users SET workplace_id = :wid WHERE user_id = :uid");
        $updUser->execute([':wid' => $newWpId, ':uid' => $user_id]);

        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire('สำเร็จ!', 'ข้อมูลสถานประกอบการได้รับการบันทึกแล้ว', 'success').then(function() {
                    window.location.href = 'std-wp-edit.php';
                });
            });
        </script>";
    } else {
        echo "<script>
            document.addEventListener('DOMContentLoaded', function() {
                Swal.fire('Error', 'มีข้อผิดพลาดในการบันทึกข้อมูล', 'error');
            });
        </script>";
    }
}
$workTypes = getWorkTypes();
?>
<body>
    <?php include 'navbar.php'; ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 680px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white" style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-building-circle-plus me-2"></i>เพิ่มสถานประกอบการใหม่</h1>
                    <p class="small opacity-75 mb-0">กรอกข้อมูลสถานประกอบการที่คุณเข้าฝึกงานเพื่อบันทึกเข้าสู่ระบบ</p>
                </div>

                <div class="p-4">
                    <form action="std-add-wp.php" method="post" enctype="multipart/form-data">
                        <div class="mb-3">
                            <label for="workplace_name" class="form-label fw-semibold small">ชื่อบริษัท / สถานประกอบการ</label>
                            <input type="text" required class="form-control" name="workplace_name" placeholder="ระบุชื่อบริษัทหรือหน่วยงาน">
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="work_type" class="form-label fw-semibold small">ประเภทงาน</label>
                                <select class="form-select" name="work_type">
                                    <?php foreach ($workTypes as $typeKey => $meta): ?>
                                        <option value="<?php echo e($typeKey); ?>"><?php echo e($meta['label']); ?></option>
                                    <?php endforeach; ?>
                                    <option value="">อื่นๆ</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="workplace_tel" class="form-label fw-semibold small">เบอร์โทรติดต่อ</label>
                                <input type="text" required class="form-control" name="workplace_tel" placeholder="เช่น 074-123456 หรือ 0812345678">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="work_des" class="form-label fw-semibold small">ลักษณะงาน</label>
                            <input type="text" required class="form-control" name="work_des" placeholder="อธิบายลักษณะงานที่ปฏิบัติโดยสังเขป">
                        </div>

                        <div class="mb-3">
                            <label for="workplace_address" class="form-label fw-semibold small">ที่อยู่บริษัท</label>
                            <textarea required class="form-control" name="workplace_address" rows="3" placeholder="ระบุบ้านเลขที่ ถนน ตำบล อำเภอ จังหวัด"></textarea>
                        </div>

                        <div class="mb-4">
                            <label for="map" class="form-label fw-semibold small">แผนที่ (ลิงก์ Google Maps)</label>
                            <input type="url" class="form-control" name="map" id="map" placeholder="https://maps.google.com/...">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" name="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-circle-plus me-1"></i> เพิ่มสถานประกอบการ
                            </button>
                            <a href="std-wp-edit.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </main>

    <?php include 'script.php'; ?>
    <script>
        addClassToElement("std-edit");
    </script>
</body>
</html>
