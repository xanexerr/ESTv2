<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include("header.php"); ?>
<body>
    <?php
    include 'navbar.php';
    include 'php/admin-check.php';

    $workplace_id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    $stmt = $conn->prepare("SELECT * FROM workplaces WHERE workplace_id = :wid LIMIT 1");
    $stmt->execute([':wid' => $workplace_id]);
    $workplacesData = $stmt->fetchAll();
    $workTypes = getWorkTypes();
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 720px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white d-flex justify-content-between align-items-center"
                     style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <div>
                        <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-pen-to-square me-2"></i>แก้ไขรายละเอียดสถานประกอบการ</h1>
                        <p class="small opacity-75 mb-0">จัดการข้อมูลและสถานะการแสดงผลบนหน้าเว็บไซต์</p>
                    </div>
                </div>

                <?php foreach ($workplacesData as $row): ?>
                    <form class="p-4" name="edit_workplace_form" method="POST" action="php/admin-wp-update.php" enctype="multipart/form-data">
                        <!-- Toggle Visibility Banner -->
                        <div class="mb-4 p-3 rounded d-flex flex-wrap justify-content-between align-items-center gap-2"
                             style="background-color: #F8FAFC; border: 1px solid var(--ssp-border);">
                            <div>
                                <div class="small text-secondary fw-semibold">สถานะการแสดงผลปัจจุบัน</div>
                                <?php if ((int)$row['show'] === 0): ?>
                                    <span class="ssp-status-badge status-hidden mt-1"><i class="fa-solid fa-eye-slash"></i> ไม่ได้แสดงสถานประกอบการ</span>
                                <?php else: ?>
                                    <span class="ssp-status-badge status-active mt-1"><i class="fa-solid fa-eye"></i> กำลังแสดงผลบนเว็บไซต์</span>
                                <?php endif; ?>
                            </div>
                            <?php if ((int)$row['show'] === 0): ?>
                                <a href="php/show-status.php?id=<?php echo e($row['workplace_id']); ?>" class="btn btn-sm btn-success rounded-pill px-3">
                                    <i class="fa-solid fa-eye me-1"></i> คลิกเพื่อเปิดแสดงผล
                                </a>
                            <?php else: ?>
                                <a href="php/show-status.php?id=<?php echo e($row['workplace_id']); ?>" class="btn btn-sm btn-danger rounded-pill px-3">
                                    <i class="fa-solid fa-eye-slash me-1"></i> คลิกเพื่อซ่อนสถานประกอบการ
                                </a>
                            <?php endif; ?>
                        </div>

                        <div class="mb-3">
                            <label for="workplace_id" class="form-label fw-semibold small">รหัสสถานประกอบการ</label>
                            <input type="text" class="form-control bg-light text-danger fw-semibold" name="workplace_id" readonly value="<?php echo e($row['workplace_id']); ?>">
                        </div>

                        <div class="mb-3">
                            <label for="workplace_name" class="form-label fw-semibold small">ชื่อสถานประกอบการ</label>
                            <input type="text" class="form-control" name="workplace_name" value="<?php echo e($row['workplace_name']); ?>" required>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="work_type" class="form-label fw-semibold small">ประเภทงาน</label>
                                <select class="form-select" name="work_type">
                                    <?php foreach ($workTypes as $typeKey => $meta): ?>
                                        <option value="<?php echo e($typeKey); ?>" <?php echo ($row['work_type'] === $typeKey) ? 'selected' : ''; ?>>
                                            <?php echo e($meta['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                    <option value="" <?php echo ($row['work_type'] === '') ? 'selected' : ''; ?>>อื่นๆ</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="work_tel" class="form-label fw-semibold small">เบอร์โทรติดต่อ</label>
                                <input type="tel" class="form-control" name="work_tel" value="<?php echo e($row['work_tel']); ?>" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label fw-semibold small">ลักษณะงาน</label>
                            <input type="text" class="form-control" name="description" value="<?php echo e($row['description']); ?>" required>
                        </div>

                        <div class="mb-3">
                            <label for="workplace_address" class="form-label fw-semibold small">ที่อยู่สถานประกอบการ</label>
                            <textarea class="form-control" name="workplace_address" rows="3" required><?php echo e($row['workplace_address']); ?></textarea>
                        </div>

                        <div class="mb-4">
                            <label for="map" class="form-label fw-semibold small">แผนที่ (Google Maps URL)</label>
                            <input type="text" class="form-control" name="map" id="map" value="<?php echo e($row['map']); ?>">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" value="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-floppy-disk me-1"></i> บันทึกการเปลี่ยนแปลง
                            </button>
                            <a href="#" class="btn btn-outline-danger py-2" onclick="confirmDelete('<?php echo e($row['workplace_id']); ?>')">
                                <i class="fa-solid fa-trash-can me-1"></i> ลบสถานประกอบการ
                            </a>
                            <a href="admin-wp.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
                        </div>
                    </form>
                <?php endforeach; ?>
            </div>
        </div>
    </main>

    <?php include 'script.php'; ?>
    <script>
        function confirmDelete(userId, admin) {
            Swal.fire({
                title: 'คุณแน่ใจหรือไม่?',
                text: 'การลบสถานประกอบการนี้ไม่สามารถย้อนกลับได้!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'ใช่, ลบทันที!',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'php/del-wp.php?id=' + encodeURIComponent(userId) + '&admin=' + encodeURIComponent(admin);
                }
            });
        }
    </script>
</body>
</html>
