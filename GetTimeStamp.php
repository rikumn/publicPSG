<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->beginTransaction();
    
    $_usuario = $_GET['usuario'];
    
    $sth = $dbh->prepare('SELECT `TimeStamp` FROM `PotionSeller_db` WHERE `WalletAddress` = '.$_usuario);    
    $sth->execute();
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    if (count($result) > 0) 
    {
        echo $result[0]['TimeStamp'];
    }
    else
    {
        echo 'no se encontro el usuario!';
    }
    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>