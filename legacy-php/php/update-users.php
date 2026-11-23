<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="../css/select2.min.css" rel="stylesheet">
    <script src="../js/sweetalert10.16.0.js"></script>
</head>
<body>
    <?php
    require_once("../connection.php");

    if (!isset($_SESSION["user_id"])) {
        echo '<script>
            Swal.fire({
                title: "คุณยังไม่ได้เข้าสู่ระบบ",
                icon: "warning",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "../login.php";
            });
        </script>';
        exit();
    } elseif (($_SESSION["role"] ?? '') !== 'admin') {
        echo '<script>
            Swal.fire({
                title: "คุณไม่มีสิทธิเข้าถึง!",
                icon: "warning",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = "../index.php";
            });
        </script>';
        exit();
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $old_user_id = trim($_POST["old_user_id"] ?? '');
        $user_id     = trim($_POST['user_id'] ?? '');
        $user_fname  = trim($_POST['user_fname'] ?? '');
        $user_lname  = trim($_POST['user_lname'] ?? '');
        $role        = trim($_POST['role'] ?? 'student');
        $password    = $_POST['password'] ?? '';

        $stmt = $conn->prepare("
            UPDATE users
            SET user_id    = :uid,
                username   = :uname,
                user_fname = :fname,
                user_lname = :lname,
                role       = :role,
                password   = :pwd
            WHERE user_id  = :old_uid
        ");

        if ($stmt->execute([
            ':uid'     => $user_id,
            ':uname'   => $user_id,
            ':fname'   => $user_fname,
            ':lname'   => $user_lname,
            ':role'    => $role,
            ':pwd'     => $password,
            ':old_uid' => $old_user_id,
        ])) {
            echo "<script>
                Swal.fire('แก้ไขข้อมูลสำเร็จ', 'ระบบได้ทำการบันทึกข้อมูลเรียบร้อย!', 'success').then(function() {
                    window.location.href = '../admin-users-manage.php';
                });
            </script>";
            exit();
        } else {
            echo "<script>
                Swal.fire('Error', 'มีข้อผิดพลาดในการแก้ไขข้อมูล', 'error').then(function() {
                    window.location.href = '../admin-users-manage.php';
                });
            </script>";
        }
    } else {
        echo "Form submission error.";
    }
    ?>
</body>
</html>
