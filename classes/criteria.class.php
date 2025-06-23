<?php
class Criteria extends dbHandler
{

    public function __construct()
    {
        parent::__construct();
    }

    public function getCriteria()
    {
        $data = array();
        $query = "SELECT * FROM criteria";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $data[] = (object) [
                    "id" => $row['id'],
                    "name" => $row['name'],
                    "equiv" => $row['equiv'],
                ];
            }
        }
        return $data;
    }

    public function updateCriteria($data)
    {
        $query = "TRUNCATE TABLE criteria;";
        if (mysqli_query($this->conn, $query)) {
            $sql = "INSERT INTO `criteria`(`name`, `equiv`) VALUES ";
            foreach ($data as $value) {
                $label = $value['label'];
                $percentage = $value['percentage'];
                if ($label != "" || $percentage != 0) {
                    $sql .= "('$label','$percentage'),";
                }
            }
            $sql = rtrim($sql, ",");
            if (mysqli_query($this->conn, $sql)) {
                return (object) ['status' => true, 'msg' => ''];
            } else {
                return (object) ['status' => false, 'sql' => $sql, 'msg' => "Error description: " . mysqli_error($this->conn)];
            }
        } else {
            return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
    }

    public function removeCriteria($id)
    {
        $query = "DELETE FROM `criteria` WHERE id='$id'";
        if (mysqli_query($this->conn, $query)) {
            return (object) ['status' => true, 'msg' => ''];
        } else {
            return (object) ['status' => false, 'sql' => $query, 'msg' => "Error description: " . mysqli_error($this->conn)];
        }
    }

    public function getSetupDefaultCriteria()
    {
        $content = '[';
        $query = "SELECT * FROM criteria";
        $result = mysqli_query($this->conn, $query);
        if (mysqli_num_rows($result)) {
            while ($row = mysqli_fetch_assoc($result)) {
                $name = $row['name'];
                $equiv = $row['equiv'];
                $content .= '{
                    "activities":
                    [
                        {"name":"1","total":"120","isLock":"false"},
                        {"name":"2","total":"120","isLock":"false"}
                    ],
                    "equiv":"' . $equiv . '",
                    "name":"' . $name . '"
                },';
            }
            $content = rtrim($content, ",");
            $content .= ']';
        }
        return $content;
    }
}
