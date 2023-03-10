<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
       
    $_usuario = $_POST['usuario'];
    $_rodos= $_POST['rodos'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');   
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0) 
    {
        $_data =  explode(';',$result[0]['Data']);
//peligro no comprueba que los datos externos son verdaderos y realiza el procediemiento con data que puede ser modificable nada mas iguala
        if (intval($_data[0]) >= $_rodos){
            $_data[0] = ''.$_rodos;
            echo join(";",$_data);
            $datos= join(";",$_data);
            $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `Data` = :datos WHERE WalletAddress = :usuario');
            $sth->bindParam(':datos', $datos, PDO::PARAM_STR);
            $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
            $sth->execute(); 
        }

    }

    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>