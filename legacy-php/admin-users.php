<?php
require_once 'connection.php';
?>
<!DOCTYPE html>
<html lang="th">
<?php include("header.php"); ?>
<body>
    <?php
    include('navbar.php');
    include('php/admin-check.php');

    $user_id = $_GET['id'] ?? '';
    $stmt = $conn->prepare("SELECT * FROM users WHERE user_id = :uid LIMIT 1");
    $stmt->execute([':uid' => $user_id]);
    $userData = $stmt->fetchAll();
    ?>

    <main class="container my-4 flex-grow-1">
        <div class="mx-auto" style="max-width: 600px;">
            <div class="ssp-card overflow-hidden">
                <div class="p-4 text-white" style="background: linear-gradient(135deg, var(--ssp-primary-dark) 0%, var(--ssp-primary) 100%);">
                    <h1 class="h5 fw-bold mb-1"><i class="fa-solid fa-user-pen me-2"></i>แก้ไขรายละเอียดบัญชีผู้ใช้</h1>
                    <p class="small opacity-75 mb-0">จัดการข้อมูลส่วนตัว สถานะสิทธิ์ และรหัสผ่านของผู้ใช้</p>
                </div>

                <?php foreach ($userData as $row): ?>
                    <form class="p-4" name="edit_workplace_form" method="POST" action="php/update-users.php" enctype="multipart/form-data">
                        <input type="hidden" name="old_user_id" value="<?php echo e($row['user_id']); ?>">

                        <div class="mb-3">
                            <label for="user_id" class="form-label fw-semibold small">รหัสผู้ใช้</label>
                            <input type="text" class="form-control fw-semibold text-danger" name="user_id" value="<?php echo e($row['user_id']); ?>" required>
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
                            <label for="role" class="form-label fw-semibold small">สถานะ / สิทธิ์การใช้งาน</label>
                            <select class="form-select" name="role" required>
                                <option value="admin" <?php echo ($row['role'] === 'admin') ? 'selected' : ''; ?>>ผู้ดูแลระบบ</option>
                                <option value="teacher" <?php echo ($row['role'] === 'teacher') ? 'selected' : ''; ?>>ครู</option>
                                <option value="student" <?php echo ($row['role'] === 'student') ? 'selected' : ''; ?>>นักเรียน นักศึกษา</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label for="password" class="form-label fw-semibold small">รหัสผ่าน</label>
                            <input type="password" class="form-control" name="password" value="<?php echo e($row['password']); ?>" required>
                        </div>

                        <div class="d-grid gap-2">
                            <button type="submit" value="submit" class="btn btn-ssp-primary py-2 fw-semibold">
                                <i class="fa-solid fa-floppy-disk me-1"></i> บันทึกการเปลี่ยนแปลง
                            </button>
                            <a href="#" class="btn btn-outline-danger py-2" onclick="confirmDelete('<?php echo e($row['user_id']); ?>')">
                                <i class="fa-solid fa-trash-can me-1"></i> ลบบัญชีผู้ใช้
                            </a>
                            <a href="admin-users-manage.php" class="btn btn-outline-secondary py-2">ยกเลิก</a>
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
                text: 'การลบบัญชีนี้ไม่สามารถย้อนกลับได้!',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#d33',
                cancelButtonColor: '#3085d6',
                confirmButtonText: 'ใช่, ลบทันที!',
                cancelButtonText: 'ยกเลิก'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = 'php/del-member.php?id=' + encodeURIComponent(userId) + '&admin=' + encodeURIComponent(admin);
                }
            });
        }
    </script>
</body>
</html>
