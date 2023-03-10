<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_data = $_POST['data'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0) 
    {
        echo 'existe!';
        if ( $_data == null) $_data = NULL;
        $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `MagicPower` = :datos WHERE `WalletAddress` = :usuario');
        $sth->bindParam(':datos', $_data, PDO::PARAM_STR);
        $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
        $sth->execute(); 
    }

    $dbh->commit();
    echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
