<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute();
    
    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    if (count($result) > 0) 
    {
        $sth = $dbh->prepare('SELECT * FROM `PocionesMagicPower` WHERE `IDUsuario`=:IDUsuario');
        $sth->bindParam(':IDUsuario', $result[0]['ID'], PDO::PARAM_INT);
        $sth->execute();
        
        $sth->setFetchMode(PDO::FETCH_ASSOC); 
        $result = $sth->fetchAll();
        //IDPociones IDUsuario TipoPocion Power Posicion Estado

        for ($i = 0; $i < count($result); $i++) {
            if ($result[$i]['Estado'] > 0){
                echo $result[$i]['IDPociones'];  echo ",";
                echo $result[$i]['IDUsuario'];   echo ",";
                echo $result[$i]['TipoPocion'];  echo ",";
                echo $result[$i]['Power'];       echo ",";
                echo $result[$i]['Posicion'];    echo ",";
                echo $result[$i]['Estado'];      echo ",";
                echo $result[$i]['Tagged'];
            }

            if ($i < count($result) - 1) { echo ";"; }
        }
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
