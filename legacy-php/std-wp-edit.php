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
                confirmButtonColor: "#136F73",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "login.php";
            });
        </script>';
        exit();
    }

    $user_id = $_SESSION["user_id"];

    // 1. Check if this student created a workplace
    $stmtCreated = $conn->prepare("SELECT * FROM workplaces WHERE user_id = :uid LIMIT 1");
    $stmtCreated->execute([':uid' => $user_id]);
    $createdWp = $stmtCreated->fetch();

    // 2. Check the student's selected workplace_id in users table
    $stmtUserWp = $conn->prepare("SELECT workplace_id FROM users WHERE user_id = :uid LIMIT 1");
    $stmtUserWp->execute([':uid' => $user_id]);
    $uRow = $stmtUserWp->fetch();
    $workplace_id = $uRow ? $uRow['workplace_id'] : null;
    $_SESSION['workplace_id'] = $workplace_id;

    // 3. Check if the student already submitted a comment
    $stmtComment = $conn->prepare("SELECT * FROM comments WHERE user_id = :uid LIMIT 1");
    $stmtComment->execute([':uid' => $user_id]);
    $existingComment = $stmtComment->fetch();
    $hasComment = ($existingComment !== false);

    // 4. If student selected an existing workplace (not created by them), fetch it
    $selectedWp = null;
    if (!$createdWp && $workplace_id !== null && $workplace_id !== '') {
        $stmtSel = $conn->prepare("SELECT * FROM workplaces WHERE workplace_id = :wid LIMIT 1");
        $stmtSel->execute([':wid' => $workplace_id]);
        $selectedWp = $stmtSel->fetch();
    }

    $workTypes = getWorkTypes();
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 720px;">

            <?php if ($createdWp): ?>
                <!-- Case A: Student added this workplace themselves -> can edit workplace details + add/edit comment -->
                <div class="ssp-card overflow-hidden">
                    <div class="p-4 text-white d-flex justify-content-between align-items-center"
                         style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                        <div>
                            <span class="badge rounded-pill bg-warning text-dark mb-1">ผู้เพิ่มข้อมูลสถานประกอบการ</span>
                            <h1 class="h5 fw-bold mb-0">เมนูแก้ไขข้อมูลสถานประกอบการของคุณ</h1>
                        </div>
                        <a href="wp-detail.php?id=<?php echo e($createdWp['workplace_id']); ?>" class="btn btn-sm btn-light rounded-pill px-3">
                            <i class="fa-solid fa-eye me-1"></i> ดูหน้าแสดงผล
                        </a>
                    </div>

                    <form class="p-4" name="edit_workplace_form" method="POST" action="php/update-wp-data.php" enctype="multipart/form-data">
                        <div class="mb-3">
                            <label for="workplace_name" class="form-label fw-semibold small">ชื่อสถานประกอบการ</label>
                            <input type="text" class="form-control" name="workplace_name" value="<?php echo e($createdWp['workplace_name']); ?>" required>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label for="work_type" class="form-label fw-semibold small">ประเภทงาน</label>
                                <select class="form-select" name="work_type">
                                    <?php foreach ($workTypes as $typeKey => $meta): ?>
                                        <option value="<?php echo e($typeKey); ?>" <?php echo ($createdWp['work_type'] === $typeKey) ? 'selected' : ''; ?>>
                                            <?php echo e($meta['label']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                    <option value="" <?php echo ($createdWp['work_type'] === '') ? 'selected' : ''; ?>>อื่นๆ</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="work_tel" class="form-label fw-semibold small">เบอร์โทรติดต่อ</label>
                                <input type="text" class="form-control" name="work_tel" value="<?php echo e($createdWp['work_tel']); ?>" required>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="description" class="form-label fw-semibold small">ลักษณะงาน</label>
                            <input type="text" class="form-control" name="description" value="<?php echo e($createdWp['description']); ?>" required>
                        </div>

                        <div class="mb-3">
                            <label for="workplace_address" class="form-label fw-semibold small">ที่อยู่บริษัท</label>
                            <textarea class="form-control" name="workplace_address" rows="3" required><?php echo e($createdWp['workplace_address']); ?></textarea>
                        </div>

                        <div class="mb-4">
                            <label for="map" class="form-label fw-semibold small">ลิงก์แผนที่ (Google Maps URL)</label>
                            <input type="url" class="form-control" name="map" id="map" value="<?php echo e($createdWp['map']); ?>" placeholder="https://maps.google.com/...">
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" value="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-floppy-disk me-1"></i> บันทึกการเปลี่ยนแปลง
                            </button>

                            <?php if ($hasComment): ?>
                                <a href="std-edit-cm.php" class="btn btn-ssp-amber py-2">
                                    <i class="fa-solid fa-pen-to-square me-1"></i> แก้ไขความคิดเห็นของคุณ
                                </a>
                            <?php else: ?>
                                <a href="std-add-cm.php" class="btn btn-ssp-amber py-2">
                                    <i class="fa-solid fa-star me-1"></i> เพิ่มความคิดเห็นและให้คะแนนรีวิว
                                </a>
                            <?php endif; ?>

                            <a href="index.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
                        </div>
                    </form>
                </div>

            <?php elseif ($selectedWp): ?>
                <!-- Case B: Student selected an existing workplace -> view summary + add/edit comment -->
                <?php $meta = getWorkTypeMeta($selectedWp['work_type']); ?>
                <div class="ssp-card overflow-hidden">
                    <div class="p-4 text-white d-flex justify-content-between align-items-center"
                         style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                        <div>
                            <span class="badge rounded-pill bg-light text-dark mb-1">สถานประกอบการที่เลือกไว้</span>
                            <h1 class="h5 fw-bold mb-0">สถานประกอบการของคุณ</h1>
                        </div>
                        <a href="wp-detail.php?id=<?php echo e($selectedWp['workplace_id']); ?>" class="btn btn-sm btn-light rounded-pill px-3">
                            <i class="fa-solid fa-eye me-1"></i> ดูหน้ารายละเอียด
                        </a>
                    </div>

                    <div class="p-4">
                        <div class="d-flex align-items-start gap-3 mb-4 pb-3 border-bottom">
                            <div class="ssp-company-icon-lg" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                <i class="<?php echo e($meta['icon']); ?>"></i>
                            </div>
                            <div>
                                <span class="ssp-type-badge mb-2" style="background: <?php echo e($meta['bg']); ?>; color: <?php echo e($meta['color']); ?>;">
                                    <i class="<?php echo e($meta['icon']); ?>"></i> <?php echo e($meta['label']); ?>
                                </span>
                                <h2 class="h4 fw-bold mb-1"><?php echo e($selectedWp['workplace_name']); ?></h2>
                            </div>
                        </div>

                        <div class="row g-3 mb-4">
                            <div class="col-12">
                                <div class="p-3 rounded bg-light">
                                    <div class="small text-secondary fw-semibold mb-1">รายละเอียดงาน</div>
                                    <div><?php echo e($selectedWp['description'] ?: '-'); ?></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 rounded bg-light h-100">
                                    <div class="small text-secondary fw-semibold mb-1">เบอร์ติดต่อ</div>
                                    <div class="fw-semibold"><?php echo e($selectedWp['work_tel'] ?: '-'); ?></div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="p-3 rounded bg-light h-100">
                                    <div class="small text-secondary fw-semibold mb-1">ที่อยู่</div>
                                    <div><?php echo e($selectedWp['workplace_address'] ?: '-'); ?></div>
                                </div>
                            </div>
                        </div>

                        <div class="d-grid gap-2">
                            <?php if ($hasComment): ?>
                                <a href="std-edit-cm.php" class="btn btn-ssp-primary py-2 fw-semibold">
                                    <i class="fa-solid fa-pen-to-square me-1"></i> แก้ไขความคิดเห็นของคุณ
                                </a>
                            <?php else: ?>
                                <a href="std-add-cm.php" class="btn btn-ssp-primary py-2 fw-semibold">
                                    <i class="fa-solid fa-star me-1"></i> เพิ่มความคิดเห็นและให้คะแนนรีวิว
                                </a>
                            <?php endif; ?>
                            <a href="index.php" class="btn btn-outline-secondary py-2">กลับหน้าแรก</a>
                        </div>
                    </div>
                </div>

            <?php else: ?>
                <!-- Case C: Student has neither selected nor added a workplace yet -->
                <div class="ssp-card p-5 text-center">
                    <div class="ssp-company-icon-lg mx-auto mb-3" style="background: var(--ssp-primary-light); color: var(--ssp-primary);">
                        <i class="fa-solid fa-building-circle-arrow-right"></i>
                    </div>
                    <h1 class="h4 fw-bold mb-2">ยังไม่ได้เลือกสถานประกอบการ</h1>
                    <p class="text-secondary mb-4">กรุณาเลือกสถานประกอบการที่มีอยู่ในระบบ หรือเพิ่มข้อมูลสถานประกอบการใหม่ที่คุณไปฝึกงาน</p>
                    <div class="d-grid gap-2 mx-auto" style="max-width: 380px;">
                        <a href="std-add-wp.php" id="std-add" class="btn btn-ssp-amber py-2">
                            <i class="fa-solid fa-circle-plus me-1"></i> เพิ่มสถานประกอบการใหม่
                        </a>
                        <a href="index.php" class="btn btn-ssp-primary py-2">
                            <i class="fa-solid fa-magnifying-glass me-1"></i> เลือกสถานประกอบการที่มีในระบบ
                        </a>
                    </div>
                </div>
                <script>
                    Swal.fire({
                        icon: 'info',
                        title: 'ไม่พบข้อมูล!',
                        text: "กรุณาเลือกหรือเพิ่มสถานประกอบการของคุณก่อน!",
                        confirmButtonColor: '#136F73',
                        confirmButtonText: 'ตกลง'
                    });
                </script>
            <?php endif; ?>

        </div>
    </main>

    <?php include 'script.php'; ?>
    <script>
        addClassToElement("std-edit");
    </script>
</body>
</html>
