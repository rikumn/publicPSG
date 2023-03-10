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
    $_sold = $_POST['sold']; //ventas 1x1
    $TipoFraude = [];
    
    /* 
    1	compra mas del stock		
    2	vendedor no vente este articulo		
    3	las pociones no deben de tener cambios		
    4	gasto mas rodos de los que tiene		
    5	los rodos no coinciden con su compra		
    6	cantidad de item erronea
    */	

    $sth = $dbh->prepare('SELECT * FROM `PotionSeller_db` WHERE `WalletAddress` = :usuario');
    $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
    $sth->execute(); 

    $sth->setFetchMode(PDO::FETCH_ASSOC); 
    $result = $sth->fetchAll();
    
    if (count($result) > 0 && $_data != null && $_data != "")
    {
        $fraude = FALSE;
        $update_data = "";
        $rodos_update = 0;
        $update_items = array(0,0,0,0,0,0);

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
            $lineaJS = explode(";", $_POST['data']);
            $rodosJS = $lineaJS[0];
            $itemsJS = explode(",", $lineaJS[1]);
            $potionsJS = explode(",", $lineaJS[2]);
            
            //Data de DB (sin cambios)
            $lineaDB = explode(";", $result[0]['Data']);
            $rodosDB = $lineaDB[0];
            $itemsDB = explode(",", $lineaDB[1]);
            $potionsDB = explode(",", $lineaDB[2]);

            $rodos_gastados = 0;

            if ($lineaJS[2] == $lineaDB[2]) //comparacion de pociones en string
            {
                //echo "pociones seguras";

                //id_item, precio item, stock item
                //0,4,40|1,6,30|2,6,30|4,10,20; //0,3,20|1,4,20; //0,4,10|2,4,20|3,6,20
                $store_listDB = $result[0]['StoreList'];
                
                //0,4,40|1,6,30|2,6,30|4,10,20 - storelist (vendedor)
                $store_seller = explode(";", $store_listDB);
                
                //0,0,4,5;//0,2,4,5 - compras realizadas (JS)
                $item_sold = explode(";", $_sold);
                
                //revisa todas las compras realizadas
                for ($j = 0; $j < count($item_sold); $j++) {

                    $encontrado = false;

                    $item_cute = explode(",", $item_sold[$j]);
                    $id_vendedorJS = $item_cute[0];
                    $id_articuloJS = $item_cute[1];
                    $item_precioJS = $item_cute[2];
                    $item_quantyJS = $item_cute[3];
                    
                    //SI el ID del vendedor de JS, es mayor a 3, //blacklist
                    //if >>> implementar
                    
                    //id_item, precio_item, stock_item - storelist
                    //0,4,40|1,6,30|2,6,30|4,10,20
                    $oferta_seller = explode("|", $store_seller[$id_vendedorJS]);
                    
                    for ($i = 0; $i < count($oferta_seller); $i++) {
                        
                        //id_item, precio_item, stock_item - storelist
                        //0,4,40
                        $oferta_unidad = explode(",", $oferta_seller[$i]);
                        $id_articuloDB = $oferta_unidad[0];
                        $item_precioDB = $oferta_unidad[2];
                        $existenciasDB = $oferta_unidad[1];
                        
                        if ($id_articuloJS == $id_articuloDB) {
                        
                            $encontrado = true;
                            
                            if ($item_precioJS == $item_precioDB &&
                                $item_quantyJS <= $existenciasDB) {
                                
                                $update_items[$id_articuloJS] += $item_quantyJS;
                                
                                $rodos_gastados += $item_quantyJS * $item_precioJS;
                            }
                            else 
                            {
                                //blacklist - PrecioDiferente, o Compra mas del Stock
                                $fraude = TRUE;
                                array_push($TipoFraude, 1);
                            }
                        }
                    }

                    if ($encontrado == false) {
                        //blacklist - El vendedor no vende este articulo
                        $fraude = TRUE; //<<<<<<<<<<<<<<<<<<<<<<<<<< revisar
                        array_push($TipoFraude, 2);
                    }
                }
            }
            else
            {
                //blacklist - Las pociones no deben tener cambios
                $fraude = TRUE;
                array_push($TipoFraude, 3);
            }

            $rodos_update = $rodosDB - $rodos_gastados;
        }

        //RODOS
        if ($rodos_update < 0)
        {
            //blacklist - gasto mas rodos de lo que tiene realmente
            $fraude = TRUE;
            array_push($TipoFraude, 4);
        }
        else
        {        
            if ($rodos_update != $rodosJS)
            {
                //blacklist - no coincide la actualizacion de rodos segun su compra
                $fraude = TRUE;
                array_push($TipoFraude, 5);
            }
        }

        //ITEMS
        for ($i = 0; $i < count($update_items); $i++) {
            
            if (($itemsDB[$i] + $update_items[$i]) != $itemsJS[$i]) 
            {
                //blacklist - cantidad de items fue manipulada en JS
                $fraude = TRUE;
                array_push($TipoFraude, 6);
            }
        }
        
        if ($fraude === FALSE)
        {
            //echo "grabando: ";
            //echo $_data;
            
            $sth = $dbh->prepare('UPDATE `PotionSeller_db` SET `Data` = :datos WHERE `WalletAddress` = :usuario');
            $sth->bindParam(':datos', $_data, PDO::PARAM_STR);
            $sth->bindParam(':usuario', $_usuario, PDO::PARAM_STR);
            $sth->execute();

            echo "success";
        }
        else
        {
    
            //wallet
            //tipo
            //tiempo

            //dataJS (data + compra)
            //sold (compra el cliente)
        
            //dataDB (data + compra = dataJS
            //storevisited
            //storelist (tienda/ofertas)

            $FraudeString = implode(',', $TipoFraude);
            
            $sth = $dbh->prepare('INSERT INTO `Fraudes` (`WalletAddress`,`DataDB`,`DataJS`,`Compras`,`StoreVisited`,`StoreList`,`TipoFraude`,`Lugar`) 
                                VALUES (:WalletAddress, 
                                        :DataDB, 
                                        :DataJS, 
                                        :Compras, 
                                        :StoreVisited, 
                                        :StoreList,
                                        :TipoFraude,
                                        :Lugar)');
            $sth->bindParam(':WalletAddress', $_usuario, PDO::PARAM_STR);
            $sth->bindParam(':DataDB', $_data, PDO::PARAM_STR);
            $sth->bindParam(':DataJS', $result[0]['Data'], PDO::PARAM_STR);
            $sth->bindParam(':Compras', $_sold, PDO::PARAM_STR);
            $sth->bindParam(':StoreVisited', $result[0]['StoreVisited'], PDO::PARAM_STR);
            $sth->bindParam(':StoreList', $result[0]['StoreList'], PDO::PARAM_STR);
            $sth->bindParam(':TipoFraude', $FraudeString, PDO::PARAM_STR);
            $sth->bindParam(':Lugar', "ingredientes", PDO::PARAM_STR);
            $sth->execute();

            echo "failed";
        }
    }

    $dbh->commit();
}
catch(PDOException $e)
{
	echo "Error: " . $e->getMessage();
}
   
?>
