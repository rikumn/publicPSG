<?php

include('ConnectTo_DB.php');

try 
{
    $dbh = new PDO('mysql:host='. $hostname .';dbname='. $database, $username, $password);
    $dbh->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
    $dbh->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $dbh->beginTransaction();
    
    $_usuario = $_POST['usuario'];
    $_data = $_POST['data']; //cambiados
    $_attended = $_POST['attended']; //ventas 1x1
    $TipoFraude = [];
    
    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0 && $_data != null && $_data != "")
    {
        $fraude = FALSE;
        $rodos_update = 0;
        $update_potions = array(0,0,0,0,0,0);

        //echo 'existe!';
        
        if ($_data == null)
        {
            //$update_data = NULL;
        } 
        else
        {
            //Data de JS (con cambios)
            //id_vendedor, id_item, precio, cantidad - ventasJS
            //0,0,5; 1,2,5; 2,4,10
            $lineaJS = explode(";", $_data);
            $rodosJS = $lineaJS[0];
            $itemsJS = explode(",", $lineaJS[1]);
            $potionsJS = explode(",", $lineaJS[2]);
            
            //Data de DB (sin cambios)
            $lineaDB = explode(";", $result[0]['Data']);
            $rodosDB = $lineaDB[0];
            $itemsDB = explode(",", $lineaDB[1]);
            $potionsDB = explode(",", $lineaDB[2]);

            $rodos_ganados = 0;
            
            if ($lineaJS[1] == $lineaDB[1]) //comparacion de items en string
            {
                //echo "ingredientes seguros";

                //id_pocion, cantidad_pocion, price_pocion
                //1,3,34; 4,1,82|2,3,44|0,5,38; 0,4,30|2,2,56|4,3,54
                $ClientsArrayDB = $result[0]['ClientsArray'];

                //4,1,82|2,3,44|0,5,38 - clientsarray (oferta)
                $clientes_array = explode(";", $ClientsArrayDB);
                $ofertas_completa = explode("|", $clientes_array[$_attended]);
                
                for ($i = 0; $i < count($ofertas_completa); $i++) {
                    
                    //id_pocion, cantidad_pocion, price_pocion - clientsarray
                    //4,1,82
                    $oferta = explode(",", $ofertas_completa[$i]);
                    $id_pocionDB = $oferta[0];
                    $cant_potsDB = $oferta[1];
                    $price_potDB = $oferta[2];
                    $rodos_ganados += $price_potDB * $cant_potsDB;
                    $update_potions[$id_pocionDB] += $cant_potsDB;
                }
            }
            else
            {
                //blacklist - Las pociones no deben tener cambios
                $fraude = TRUE;
                array_push($TipoFraude, 1);
            }
        }

        $rodos_update = $rodosDB + $rodos_ganados;
        //RODOS
        if ($rodos_update < 0)
        {
            //blacklist - gasto mas rodos de lo que tiene realmente
            $fraude = TRUE;
            array_push($TipoFraude, 2);
        }
        else
        {
            if ($rodos_update != $rodosJS)
            {
                //blacklist - no coincide la actualizacion de rodos segun su compra
                $fraude = TRUE;
                array_push($TipoFraude, 3);
            }
        }

        //POCIONES
        for ($i = 0; $i < count($update_potions); $i++) {
            
            $update_pot = $potionsDB[$i] - $update_potions[$i];

            if ($update_pot != $potionsJS[$i] || $update_pot < 0)
            {
                //blacklist - cantidad de pociones fue manipulada en JS
                $fraude = TRUE;
                array_push($TipoFraude, 4);
            }
        }
        
        if ($fraude === FALSE)
        {
            //echo "grabando: ";
            $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `Data` = :datos WHERE `WalletAddress` = :usuario');
            $sth->bindParam(':datos', $_data, PDO::PARAM_STR);
            $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
            $success = $sth->execute();
            if ($success == true) { echo "success"; } else { echo "failed"; }
        }
        else
        {
    
            //wallet
            //tipo
            //tiempo

            //dataJS (data + compra)
            //dataDB (data + compra = dataJS

            //ClientsAttended
            //ClientsArray (tienda/ofertas)

            $FraudeString = implode(',', $TipoFraude);

            $sth = $dbh->prepare('INSERT  INTO `Fraudes` (`WalletAddress`,`DataDB`,`DataJS`,`StoreVisited`,`StoreList`,`TipoFraude`,`Lugar`)
                                VALUES (:WalletAddress,
                                        :DataDB,
                                        :DataJS,
                                        :StoreVisited,
                                        :StoreList,
                                        :TipoFraude,
                                        :Lugar)');
            $sth->bindParam(':WalletAddress', $_usuario, PDO::PARAM_STR);
            $sth->bindParam(':DataDB', $_data, PDO::PARAM_STR);
            $sth->bindParam(':DataJS', $result[0]['Data'], PDO::PARAM_STR);
            $sth->bindParam(':StoreVisited', $_attended, PDO::PARAM_STR);
            $sth->bindParam(':StoreList', $result[0]['ClientsArray'], PDO::PARAM_STR);
            $sth->bindParam(':TipoFraude', $FraudeString, PDO::PARAM_STR);
            $sth->bindParam(':Lugar', "plaza", PDO::PARAM_STR);
            $sth->execute();

            echo "failed";
        }
    }

    $dbh->commit();
    //echo count($result);
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
