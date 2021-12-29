import React, { useState } from 'react'
import { Header } from './components/Header'

import worker1 from './workers/RoutingWorker1';
import worker2 from './workers/RoutingWorker2';
import WebWorker from './workers/WebWorker';

import { YMaps, Map } from 'react-yandex-maps';
import { Tabs } from './components/Tabs';
import { Depo } from './components/Depo';

let ymap = null
let myMap = null
let clientsCount = 0
let transportCount = 0

function App() {

  const [depo, setDepo] = useState({address: "", marker: null})
  const [clients, setClients] = useState([])
  const [transport, setTransport] = useState([])
  const [maxTemp, setMaxTemp] = useState(1000)
  const [minTemp, setMinTemp] = useState(0.01)
  const [shortestDistanceMatrix, setShortestDistanceMatrix] = useState([])
  const [result, setResult] = useState(null)

  const [isResultPage, setIsResultPage] = useState(false)
  const [isCalculation, setIsCalculation] = useState(false)

  const [algorithm, setAlgorithm] = useState(true)


  function MoveToCoordinates(obj){
    if(ymap !== null && myMap){
      if(obj.marker !== null){
        myMap.setCenter(obj.marker.geometry.getCoordinates(), 10)
      }
    }
  }
  
  //-------------------Депо----------------------
  function SearchByAddressDepo(address){
    if(ymap !== null && myMap){
      if(address !== ""){
        ymap.geocode(address, {
          results: 1
        }).then((res) => {
          let geoObject = res.geoObjects.get(0)
          if(geoObject){
            let coords = geoObject.geometry.getCoordinates()
            let adr = geoObject.getAddressLine()
            if(depo.marker === null){
              let depoGeoObject = new ymap.Placemark(coords, {
                iconContent: 'Депо',
                balloonContent: adr
              }, {
                preset: 'islands#darkblueStretchyIcon',
                draggable: false
              })
        
              setDepo({address: adr, marker: depoGeoObject})
              myMap.geoObjects.add(depoGeoObject);
              myMap.setCenter(coords, 10)
            }else{
              depo.marker.geometry.setCoordinates(coords)
            }
          }else{
            //Не найдено
            alert("Не удалось найти адрес депо")
            setDepo({...depo, address: ""})
          }
        });
      }
    }
  }

  function DeleteDepo(){
    if(ymap !== null && myMap){
      if(depo.marker !== null){
        myMap.geoObjects.remove(depo.marker)
        setDepo({address: "", marker: null})
      }
    }
  }
  //---------------------------------------------
  //-----------------Клиенты---------------------
  function AddClient(){
    ++clientsCount 
    setClients([...clients, {address: "", marker: null, demand: 1, name: `Клиент ${clientsCount}`}])
  }

  function DeleteClient(index){
    if(ymap !== null && myMap){
      if(clients[index].marker !== null){
        myMap.geoObjects.remove(clients[index].marker)
      }
    }
    let mas = [...clients]
    mas.splice(index, 1)
    setClients(mas)
  }

  function UpdateClient(index, obj){
    let mas = [...clients]
    mas[index] = obj
    setClients(mas)
  }

  function SearchByAddressClient(address, index){
    if(ymap !== null && myMap){
      if(address !== ""){
        ymap.geocode(address, {
          results: 1
        }).then((res) => {
          let geoObject = res.geoObjects.get(0)
          if(geoObject){
            let coords = geoObject.geometry.getCoordinates()
            let adr = geoObject.getAddressLine()
            
            if(clients[index].marker === null){
              let depoGeoObject = new ymap.Placemark(coords, {
                iconContent: clients[index].name,
                balloonContent: adr
              }, {
                preset: 'islands#redStretchyIcon',
                draggable: false
              })
        
              UpdateClient(index, {...clients[index], address: adr, marker: depoGeoObject})
              myMap.geoObjects.add(depoGeoObject);
              myMap.setCenter(coords, 10)
            }else{
              clients[index].marker.geometry.setCoordinates(coords)
            }
          }else{
            //Не найдено
            alert(`Не удалось найти адрес ${clients[index].name}`)
            UpdateClient(index, {...clients[index], address: ""})
          }
        });
      }
    }
  }
  //---------------------------------------------
  //-----------------Транспорт-------------------
  function randColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function AddTransport(){
    ++transportCount 
    setTransport([...transport, {tonage: 1, fuel_consumption: 1, name: `Транспорт ${transportCount}`}])
  }

  function DeleteTransport(index){
    let mas = [...transport]
    mas.splice(index, 1)
    setTransport(mas)
  }

  function UpdateTransport(index, obj){
    let mas = [...transport]
    mas[index] = obj
    setTransport(mas)
  }
  //--------------------------------------------

  function Validity(){
    if(depo.marker === null){
      alert("Не найден адрес депо.")
      return false
    }
    if(clients.length === 0){
      alert("Добавьте хотя бы одного клиента.")
      return false
    }
    for(let i = 0; i < clients.length; ++i){
      if(clients[i].marker === null){
        alert(`Не найден адрес ${clients[i].name}.`)
        return false
      }
    }
    if(transport.length === 0){
      alert("Добавьте хотя бы один транспорт.")
      return false
    }
    return true
  }

  function RouteBuilding(){

    setIsCalculation(true)

    if(!isResultPage){

      if(!Validity()){
        setIsCalculation(false)
        return
      }

      setIsResultPage(true)

      let shortest_distance_matrix = []

      for(let i = 0; i < clients.length + 1; ++i){
        shortest_distance_matrix.push([])
        for(let j = 0; j < clients.length + 1; ++j){
          shortest_distance_matrix[i].push(0)
        }
      }

      let countResp = (clients.length + 1) * clients.length / 2

      for(let i = 0; i < clients.length + 1; ++i){
        for(let j = i; j < clients.length + 1; ++j){
          let multiRoute = null
          if(i !== j){
            if(i === 0){
              multiRoute = new ymap.multiRouter.MultiRoute({   
                referencePoints: [depo.marker.geometry.getCoordinates(), clients[j-1].marker.geometry.getCoordinates()],
                params: {
                  routingMode: "auto",
                  multiRoute: false  
                }
              })
            }else{
              multiRoute = new ymap.multiRouter.MultiRoute({   
                referencePoints: [clients[i-1].marker.geometry.getCoordinates(), clients[j-1].marker.geometry.getCoordinates()],
                params: {
                  routingMode: "auto",
                  multiRoute: false  
                }
              })
            }
            
            multiRoute.model.events.add('requestsuccess', function() {
              var activeRoute = multiRoute.getActiveRoute();
              if(activeRoute === null){
                setIsCalculation(false)
                setIsResultPage(false)
                if(i === 0){  
                  alert(`Не удалось найти маршрут Депо - ${clients[j-1].name}`)
                }else{
                  alert(`Не удалось найти маршрут ${clients[i-1].name} - ${clients[j-1].name}`)
                }
                return
              }
              let val = activeRoute.properties.get("distance").value
              shortest_distance_matrix[i][j] = val
              shortest_distance_matrix[j][i] = val
              if(--countResp === 0){
                setShortestDistanceMatrix(shortest_distance_matrix)
                final(shortest_distance_matrix) 
              }
            })
          }
        }
      }
    }else{
      if(result !== null){
        result.routesMarker.forEach(element => {
          myMap.geoObjects.remove(element)
        })
        setResult(null)
      }
      final(shortestDistanceMatrix)
    }

    function final(distanceMatrix){

      console.log(distanceMatrix)

      let cl = []
      clients.forEach(el => {
        cl.push(Number(el.demand))
      })

      let tr = []
      transport.forEach(el => {
        tr.push({tonage: Number(el.tonage), fuel_consumption: Number(el.fuel_consumption/100000)})
      })

      let routingData = {
        max_temperature: maxTemp, 
        min_temperature: minTemp, 
        shortest_distance_matrix: distanceMatrix,
        clients: cl,
        transport: tr,
      }

      let Myworker = null
      if(algorithm){
        Myworker = new WebWorker(worker1);
      }else{
        Myworker = new WebWorker(worker2);
      }
      Myworker.addEventListener('message', event => {
        const data = event.data;
        if(data === null){
          setIsCalculation(false)
          setIsResultPage(false)
          alert("Недостаточно ТС для осуществления доставки.")
          return
        }
        GetResult(data)
      })

      Myworker.postMessage(routingData);
    }
  }

  function GetResult(data){
    let balloonLayout = ymap.templateLayoutFactory.createClass(
      "<div>", {
      build: function () {
      this.constructor.superclass.build.call(this);
      }
    });

    let res = {routes: [], colors: [], routesMarker: [], runningTime: data.runningTime}
    for(let i = 0; i < transport.length; ++i){
      let lenRoute = data.route[i].length
      if(lenRoute > 2){
        let color = randColor()
        res.colors.push(color)
        let elem_routes = {transport: transport[i].name, route: [], route_distance: 0, fuel_quantity: 0, load: ""}
        let coords = []
        for(let j = 0; j < lenRoute; ++j){
          let index = data.route[i][j]
          if(index === 0){
            elem_routes.route.push({name: "Депо", address: depo.address})
            coords.push(depo.marker.geometry.getCoordinates())
          }else{
            elem_routes.route.push({name: clients[index - 1].name, address: clients[index - 1].address, quantity_goods: data.y[i][index - 1]})
            coords.push(clients[index - 1].marker.geometry.getCoordinates())
          }
        }
        elem_routes.route_distance = (data.routes_distance[i] / 1000).toFixed(3)
        elem_routes.fuel_quantity = data.fuel_quantity[i].toFixed(3)
        elem_routes.load = `${transport[i].tonage - data.free[i]}/${transport[i].tonage}`
        res.routes.push(elem_routes)
        let multiRoute = new ymap.multiRouter.MultiRoute({
          referencePoints: coords
        }, {
          multiRoute: false, 
          // Внешний вид линии активного маршрута.
          routeActiveStrokeColor: color,

          wayPointVisible: false,
          viaPointVisible: false,
          routeActiveMarkerVisible: false,

          balloonLayout: balloonLayout
        })
        res.routesMarker.push(multiRoute)
        myMap.geoObjects.add(multiRoute);
      }
    }
    setResult(res)
    setIsCalculation(false)
  }

  function Save(){
    
    let obj = null
    if(result){
      obj = {routes: [...result.routes]}
    }
    return JSON.stringify(obj)
  }

  function Download(dld){
    clientsCount = 0
    transportCount = 0

    myMap.geoObjects.removeAll()

    let cl = []
    dld.clients.forEach(element => {
      ++clientsCount
      let demand = Number(element.demand)
      if(isNaN(demand) || demand <= 0){
        demand = 1
      }
      cl = [...cl, {address: element.address, marker: null, demand: demand, name: `Клиент ${clientsCount}`}]
    })

    let count = cl.length + 1


    let d = {...dld.depo, marker: null}
    if(ymap !== null && myMap){
      if(d.address !== ""){
        ymap.geocode(d.address, {
          results: 1
        }).then((res) => {
          let geoObject = res.geoObjects.get(0)
          if(geoObject){
            let coords = geoObject.geometry.getCoordinates()
            let adr = geoObject.getAddressLine()
              let depoGeoObject = new ymap.Placemark(coords, {
                iconContent: 'Депо',
                balloonContent: adr
              }, {
                preset: 'islands#darkblueStretchyIcon',
                draggable: false
              })
        
              d = {...d, marker: depoGeoObject}
              myMap.geoObjects.add(depoGeoObject);
              myMap.setCenter(coords, 10)
          }
          if(--count === 0){
            finish_download(cl, d)
          }
        });
      }
    }

    let tr = []
    dld.transport.forEach(element => {
      ++transportCount 
      let tonage = Number(element.tonage)
      if(isNaN(tonage) || tonage <= 0){
        tonage = 1
      }
      let fuel_consumption = Number(element.fuel_consumption)
      if(isNaN(fuel_consumption) || fuel_consumption <= 0){
        fuel_consumption = 1
      }
      tr = [...tr, {tonage: tonage, fuel_consumption: fuel_consumption, name: `Транспорт ${transportCount}`}]
    })
    setTransport(tr)


    for(let i = 0; i < cl.length; ++i){
      if(ymap !== null && myMap){
        if(cl[i].address !== ""){
          ymap.geocode(cl[i].address, {
            results: 1
          }).then((res) => {
            let geoObject = res.geoObjects.get(0)
            if(geoObject){
              let coords = geoObject.geometry.getCoordinates()
              let adr = geoObject.getAddressLine()
              
                let depoGeoObject = new ymap.Placemark(coords, {
                  iconContent: cl[i].name,
                  balloonContent: adr
                }, {
                  preset: 'islands#redStretchyIcon',
                  draggable: false
                })
          
                cl[i].marker = depoGeoObject
                myMap.geoObjects.add(depoGeoObject);
            }
            if(--count === 0){
              finish_download(cl, d)
            }
          })
        }
      }
    }
  }

  function finish_download(cl, d){
    setClients(cl)
    setDepo(d)
  }

  function readFile(e){
    let file = e.target.files[0];
    let reader = new FileReader();
    try{
      reader.readAsText(file);
    }catch{
      alert("Ошибка при загрузке файла.")
    }
    reader.onload = function() {
      try{
        let file = JSON.parse(reader.result)
        Download(file)
      }catch{
        alert("Ошибка при загрузке файла.")
      }
    };
    reader.onerror = function() {
      alert("Ошибка при загрузке файла.")
    };
    e.target.value = null;
  }

  return (
    <>
      <Header/>
      <div className="container-main">
        <YMaps
          query={{apikey: '3f986e04-f7b1-4adb-b46e-7b10c34c7c6f'}}
        >
          <Map
            instanceRef={map => myMap = map}
            className="map"
            defaultState={{ 
              center: [55.75, 37.57], 
              zoom: 9,
              controls: ['zoomControl']
            }}
            modules={['control.ZoomControl', 'geocode', 'Placemark', 'multiRouter.MultiRoute', 'templateLayoutFactory']} 
            onLoad={(ymaps) => {
                ymap = ymaps
            }}
          >
          </Map>
        </YMaps>
        <div className="sidebar">
          
          {!isResultPage ?
            <>
              <div className="blok">
                <h3 style={{marginRight: 5}}>Загрузка файла с данными</h3>
                <input type="file" accept=".json" onChange={(e) => readFile(e)}></input>
              </div>
              <Depo depo={depo} setDepo={setDepo} SearchByAddressDepo={SearchByAddressDepo} MoveToCoordinates={MoveToCoordinates} DeleteDepo={DeleteDepo}/>
              <Tabs clients={clients} AddClient={AddClient} DeleteClient={DeleteClient} UpdateClient={UpdateClient} SearchByAddressClient={SearchByAddressClient} MoveToCoordinates={MoveToCoordinates}
                    transport={transport} AddTransport={AddTransport} DeleteTransport={DeleteTransport} UpdateTransport={UpdateTransport}
              />
            </>
            :
            <>
              {isCalculation ? 
                <div className="result">
                  <h2>Построение маршрута...</h2>
                </div> 
                : 
                <div className="result">
                  <h2>Результат</h2>
                  <div className="output">
                    {result ? 
                      <>
                        <p>Время работы алгоритма: {result.runningTime}мс</p>
                        <p style={{textAlign: "center", marginTop: 5}}><b>Маршруты</b></p>
                      {result.routes.map((elem, index) => {
                      return(
                        <div className="blok" style={{marginTop:10}} key={index}>
                          <p style={{marginRight: 10}}>{elem.transport}</p>
                          <p>Загруженность: {elem.load}</p>
                          <div style={{display: 'flex'}}>
                            <div style={{width:20, height:20, backgroundColor: result.colors[index], marginRight: 10}}></div>
                            <p style={{marginRight: 10}}>Маршрут:</p>
                            <p style={{marginRight: 10}}>{`${elem.route_distance}км.`}</p>
                            <p>{`${elem.fuel_quantity}л. топлива`}</p>
                          </div>
                          <ul style={{marginTop: 3, marginBottom: 3}}>
                            {elem.route.map((e, i) => {
                              if(i === 0 || i === elem.route.length-1){
                                return(
                                  <li key={i}>{`${e.name}: ${e.address}`}</li>
                                )
                              }else{
                                return(
                                  <li key={i}>{`${e.name}: ${e.address} - товар: ${e.quantity_goods}`}</li>
                                )
                              }
                            })}
                          </ul>
                        </div>
                      )
                    })}
                    </>
                    : null}
                  </div>
                  <div className="blok">
                    <a href={`data:applicatiom/json,${Save()}`} download="sdvrp.json"><button style={{width: 365}}>Сохранить результат</button></a>
                    <button style={{width: 365, marginTop: 3}} disabled={isCalculation} onClick={() => {
                      if(result !== null){
                        result.routesMarker.forEach(element => {
                          myMap.geoObjects.remove(element)
                        })
                        setResult(null)
                      }
                      setIsResultPage(false)
                    }}>Изменить данные</button>
                  </div>
                </div>}
            </>
          }
          <div className="blok">
            <h3 style={{textAlign: "center", marginBottom: 3}}>Параметры алгоритма</h3>
            <div className="flex">
              <p className="margin_label">Максимальная температура:</p>
              <input type="number" value={maxTemp} min="0" step="any"
                onChange={(event)=> setMaxTemp(event.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={() => {
                  if(maxTemp === "" || maxTemp[0] === "0"){
                    setMaxTemp(1000)
                  }
                }}
              >
              </input>
            </div>
            <div className="flex" style={{marginTop: 3}}>
              <p className="margin_label">Минимальная температура:</p>
              <input type="number" value={minTemp} min="0" step="any"
                onChange={(event)=> setMinTemp(event.target.value.replace(/[^0-9.]/g, ''))}
                onBlur={() => {
                  if(minTemp === "" || minTemp[0] === "0"){
                    setMinTemp(0.01)
                  }
                }}  
              >
              </input>
            </div>
            <div>
              <p>Вариант алгоритма:</p>
              <div className="flex">
                <input 
                  type="radio" 
                  checked={algorithm === true} 
                  onChange={() => setAlgorithm(true)}
                ></input>
                <p>Алгоритм №1</p>
              </div>
              <div className="flex">
                <input 
                  type="radio" 
                  checked={algorithm === false} 
                  onChange={() => setAlgorithm(false)}
                ></input>
                <p>Алгоритм №2</p>
              </div>
            </div>
            <div className="flex">
              <button className="btn" style={{marginTop: 3}} disabled={isCalculation} onClick={() => RouteBuilding()}>Построить маршрут</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;