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
    require_once('../connection.php');

    if (!isset($_SESSION["user_id"])) {
        echo '<script>
            Swal.fire({
                title: "คุณยังไม่ได้เข้าสู่ระบบ",
                icon: "error",
                confirmButtonText: "ตกลง"
            }).then(() => {
                window.location.href = "../login.php";
            });
        </script>';
        exit();
    } elseif (($_SESSION["role"] ?? '') !== 'admin') {
        echo '<script>
            Swal.fire({
                title: "คุณไม่มีสิทธิเข้าถึง!",
                icon: "error",
                confirmButtonText: "ตกลง"
            }).then(() => {
                window.location.href = "../index.php";
            });
        </script>';
        exit();
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        $user_fname = trim($_POST['user_fname'] ?? '');
        $user_lname = trim($_POST['user_lname'] ?? '');
        $username   = trim($_POST['username'] ?? '');
        $user_tel   = trim($_POST['user_tel'] ?? '');
        $user_type  = trim($_POST['user_type'] ?? 'student');

        $stmt = $conn->prepare("SELECT * FROM users WHERE username = :username OR user_id = :username");
        $stmt->bindParam(':username', $username, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result) {
            echo '<script>
                Swal.fire({
                    title: "เคยลงทะเบียนบัญชีไปแล้ว",
                    icon: "warning",
                    confirmButtonText: "ตกลง"
                }).then(() => {
                    window.location.href = "../admin-users-manage.php";
                });
            </script>';
        } else {
            $stmt = $conn->prepare("INSERT INTO users (user_fname, user_lname, username, password, role, user_id, user_tel) VALUES (?, ?, ?, ?, ?, ?, ?)");
            if ($stmt->execute([$user_fname, $user_lname, $username, $username, $user_type, $username, $user_tel])) {
                echo '<script>
                    Swal.fire({
                        title: "เพิ่มผู้ใช้สำเร็จ!",
                        icon: "success",
                        confirmButtonText: "ตกลง"
                    }).then(() => {
                        window.location.href = "../admin-users-manage.php";
                    });
                </script>';
            } else {
                echo '<script>
                    Swal.fire({
                        title: "มีข้อผิดพลาดในการเพิ่มข้อมูล",
                        text: "' . e($stmt->errorInfo()[2] ?? '') . '",
                        icon: "error",
                        confirmButtonText: "ตกลง"
                    }).then(() => {
                        window.location.href = "../admin-users-manage.php";
                    });
                </script>';
            }
        }
    }
    ?>
</body>
</html>
