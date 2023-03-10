<?php
/*
include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_timestamp = $_POST['TS'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = '.$_usuario);   
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0) 
    {
        echo 'existe!';
        if ( $_timestamp == null) $_timestamp = NULL;
        $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `TimeStamp` = '.$_timestamp.' WHERE WalletAddress = '. $_usuario);
        $sth->execute(); 
    }
    
    $dbh->commit();
    echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
*/ 
?>
