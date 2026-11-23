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
    require_once "../connection.php";

    if ($_SERVER["REQUEST_METHOD"] === "POST") {
        if (isset($_POST['workplace_name'], $_POST['work_type'], $_POST['description'], $_POST['work_tel'], $_POST['workplace_address'])) {
            $workplace_id      = (int)$_POST['workplace_id'];
            $workplace_name    = trim($_POST['workplace_name']);
            $work_type         = trim($_POST['work_type']);
            $description       = trim($_POST['description']);
            $work_tel          = trim($_POST['work_tel']);
            $workplace_address = trim($_POST['workplace_address']);
            $map               = trim($_POST['map'] ?? '');

            $stmt = $conn->prepare("
                UPDATE workplaces
                SET workplace_name    = :wname,
                    work_type         = :wtype,
                    description       = :wdes,
                    work_tel          = :wtel,
                    workplace_address = :waddr,
                    map               = :wmap
                WHERE workplace_id    = :wid
            ");

            if ($stmt->execute([
                ':wname' => $workplace_name,
                ':wtype' => $work_type,
                ':wdes'  => $description,
                ':wtel'  => $work_tel,
                ':waddr' => $workplace_address,
                ':wmap'  => $map,
                ':wid'   => $workplace_id,
            ])) {
                $location = (($_SESSION['role'] ?? '') === 'admin') ? '../admin-wp.php' : '../teacher-wp.php';
                echo '<script>
                    Swal.fire({
                        title: "แก้ไขข้อมูลสำเร็จ!",
                        icon: "success",
                        confirmButtonText: "ตกลง"
                    }).then(() => {
                        window.location.href = "' . $location . '";
                    });
                </script>';
            } else {
                echo "เกิดข้อผิดพลาด";
            }
        } else {
            echo "Please fill all the required fields.";
        }
    } else {
        echo "Form submission error.";
    }
    ?>
</body>
</html>
