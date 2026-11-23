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
        $user_id      = $_SESSION['user_id'] ?? '';
        $rating       = isset($_POST['rate']) ? (float)$_POST['rate'] : false;
        $workplace_id = isset($_POST['workplace_id']) ? (int)trim($_POST['workplace_id']) : 0;
        $comment_text = trim($_POST['comment'] ?? '');

        if ($rating === false || $rating <= 0 || $workplace_id <= 0 || $user_id === '') {
            echo "<script>
                Swal.fire('Error', 'กรุณาให้คะแนนดาวและกรอกข้อมูลให้ครบถ้วน', 'error').then(function() {
                    window.location.href = '../std-add-cm.php';
                });
            </script>";
            exit();
        }

        // Check if student already commented
        $checkStmt = $conn->prepare("SELECT COUNT(*) FROM comments WHERE user_id = :uid");
        $checkStmt->execute([':uid' => $user_id]);
        $comment_count = (int)$checkStmt->fetchColumn();

        if ($comment_count > 0) {
            echo "<script>
                Swal.fire('คุณแสดงความเห็นไปแล้ว', 'คุณได้แสดงความเห็นไปแล้ว', 'warning').then(function() {
                    window.location.href = '../std-wp-edit.php';
                });
            </script>";
            exit();
        }

        $storedFileName = null;
        if (isset($_FILES['img']) && $_FILES['img']['error'] !== 4 && $_FILES['img']['error'] === UPLOAD_ERR_OK) {
            $img        = $_FILES['img'];
            $extension  = explode(".", $img['name']);
            $fileActExt = strtolower(end($extension));
            $fileNew    = rand() . "." . $fileActExt;
            $filePath   = "../img/" . $fileNew;

            if (move_uploaded_file($img['tmp_name'], $filePath)) {
                $storedFileName = $fileNew;
            } else {
                echo "<script>
                    Swal.fire('Error', 'Failed to upload image.', 'error').then(function() {
                        window.location.href = '../std-wp-edit.php';
                    });
                </script>";
                exit();
            }
        }

        $insStmt = $conn->prepare("
            INSERT INTO comments (user_id, rating, workplace_id, comment_text, img, `show`)
            VALUES (:uid, :rating, :wid, :ctext, :img, 1)
        ");

        if ($insStmt->execute([
            ':uid'    => $user_id,
            ':rating' => $rating,
            ':wid'    => $workplace_id,
            ':ctext'  => $comment_text,
            ':img'    => $storedFileName,
        ])) {
            recalculateWorkplaceRating($conn, $workplace_id);
            echo "<script>
                Swal.fire('แสดงความคิดเห็นสำเร็จ', 'บันทึกข้อมูลของคุณเข้าสู่ระบบแล้ว', 'success').then(function() {
                    window.location.href = '../wp-detail.php?id=$workplace_id';
                });
            </script>";
            exit();
        } else {
            echo "<script>
                Swal.fire('Error', 'Failed to submit comment.', 'error').then(function() {
                    window.location.href = '../index.php';
                });
            </script>";
            exit();
        }
    } else {
        echo "<script>
            Swal.fire('Error', 'Form not submitted!', 'error').then(function() {
                window.location.href = '../index.php';
            });
        </script>";
    }
    ?>
</body>
</html>
