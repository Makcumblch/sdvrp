function RoutingWorker(){
    
    function GetInitialState(transport, clients){

        let y = [] //количество груза, доставляемого ТС клиентам
        let route = [] //последовательность клиентов (маршрут) для каждого ТС
        let free = [] //загруженность ТС
        for(let v = 0; v < transport.length; ++v){
            y.push([])
            free.push(transport[v].tonage)
            route.push([0])
            for(let i = 0; i < clients.length; ++i){
                y[v].push(0)
            }
        }
        
        let v = 0 //индекс рассматриваемого ТС
        for(let i = 0; i < clients.length; ++i){
            let q = clients[i]
            while(q !== 0){
                if(q < free[v]){
                    y[v][i] = q
                    free[v] -= q //загружаем ТС
                    q = 0 //спрос i-го клиента удовлетворен
                    route[v].push(i+1) //добавляем i-го клиента в маршрут ТС v
                }else {
                    if(q === free[v]){
                        y[v][i] = q
                        q = 0
                    }else{
                        y[v][i] = free[v]
                        q = q - free[v] //спрос i-го клиента частично удовлетворен
                    }
                    free[v] = 0
                    route[v].push(i+1)
                    v = v + 1 //переходим к следующему ТС
                    if(v === transport.length){
                        if((i !== clients.length-1) || (q !== 0)){
                            return null
                        }
                    }
                }
            }
        }
        for(v = 0; v < transport.length; ++v){
            route[v].push(0)
        }
        let State = {
            y: y,
            route: route,
            free: free
        }
        return State
    }

    function GetStateCost(State, transport, shortest_distance_matrix){
        let cost = 0
        for(let v = 0; v < transport.length; ++v){
            for(let r = 0; r < State.route[v].length - 1; ++r){
                cost = cost + shortest_distance_matrix[State.route[v][r]][State.route[v][r + 1]] * transport[v].fuel_consumption
            }
        }
        return cost
    }

    function CustomerExchange(State, transport){
        let v1 = 0
        do{
            v1 = Math.floor(Math.random() * transport.length) //случайно выбираем первое ТС, в котором маршрут имеет хотя бы одного клиента
        } while(State.route[v1].length <= 2)

        let v2 = 0
        do{
            v2 = Math.floor(Math.random() * transport.length) //случайно выбираем второе ТС, в котором маршрут имеет хотя бы одного клиента
        } while(State.route[v2].length <= 2)

        let i1 = Math.floor(Math.random() * (State.route[v1].length - 2)) + 1 //случайный индекс в списке, на месте которого находится клиент
        let i2 = Math.floor(Math.random() * (State.route[v2].length - 2)) + 1

        let client1 = State.route[v1][i1] - 1 //получаем номер клиента из маршрута ТС v1
        let client2 = State.route[v2][i2] - 1//получаем номер клиента из маршрута ТС v2

        function DemandsExchange(v1_, client1_, i1_, v2_, client2_, i2_){
            State.y[v2_][client1_] += State.y[v1_][client1_]
            State.free[v2_] -= State.y[v1_][client1_]
            State.free[v1_] += State.y[v1_][client1_]
            State.y[v1_][client1_] = 0
            State.route[v1_].splice(i1_, 1)

            if(State.y[v2_][client2_] > State.free[v1_]){
                State.y[v1_][client2_] += State.free[v1_]
                State.y[v2_][client2_] -= State.free[v1_]
                State.free[v2_] += State.free[v1_]
                State.free[v1_] = 0
            }else{
                State.y[v1_][client2_] += State.y[v2_][client2_]
                State.free[v2_] += State.y[v2_][client2_]
                State.free[v1_] -= State.y[v2_][client2_] 
                State.y[v2_][client2_] = 0
                State.route[v2_].splice(i2_, 1)
            }
        }

        if(v1 === v2){
            let tmp = State.route[v1][i1]
            State.route[v1][i1] = State.route[v1][i2]
            State.route[v1][i2] = tmp
        }else{
            if(client1 !== client2){
                if(State.y[v1][client1] === State.y[v2][client2]){
                        State.y[v1][client2] += State.y[v2][client2]
                        State.y[v2][client2] = 0
                        State.y[v2][client1] += State.y[v1][client1]
                        State.y[v1][client1] = 0
                        State.route[v1].splice(i1, 1)
                        State.route[v2].splice(i2, 1)
                }else if(State.y[v1][client1] < State.y[v2][client2]){
                    DemandsExchange(v1, client1, i1, v2, client2, i2)
                }else{
                    DemandsExchange(v2, client2, i2, v1, client1, i1)
                }
            
                let flag1 = false
                let flag2 = false
                for(let i = 1; i < State.route[v2].length - 1; ++i){
                    if((client1 + 1) === State.route[v2][i]){
                        flag1 = true
                        break
                    }
                }
                for(let i = 1; i < State.route[v1].length - 1; ++i){
                    if((client2 + 1) === State.route[v1][i]){
                        flag2 = true
                        break
                    }
                }
                if(!flag1){
                    State.route[v2].splice(i2, 0, client1 + 1)
                }
                if(!flag2){
                    State.route[v1].splice(i1, 0, client2 + 1)
                }
            }
        }
        
        return State
    }

    function CustomerTransfer(State, transport){
        let v1 = 0
        do{
            v1 = Math.floor(Math.random() * transport.length) //случайно выбираем первое ТС, в котором маршрут имеет хотя бы одного клиента
        } while(State.route[v1].length <= 2)

        let v2 = 0
        v2 = Math.floor(Math.random() * transport.length) //случайно выбираем второе ТС, в котором маршрут имеет хотя бы одного клиента

        let i1 = Math.floor(Math.random() * (State.route[v1].length - 2)) + 1 //случайный индекс в списке, на месте которого находится клиент

        let client1 = State.route[v1][i1] - 1 //получаем номер клиента из маршрута ТС v1

        if(v1 === v2){
            let i2 = Math.floor(Math.random() * (State.route[v2].length - 2)) + 1
            let tmp = State.route[v1][i1]
            State.route[v1][i1] = State.route[v1][i2]
            State.route[v1][i2] = tmp
        }else{
            if(State.free[v2] !== 0){
                if(State.route[v2].length !== 2){
                    let flag = false
                    for(let i = 1; i < State.route[v2].length - 1; ++i){
                        if(State.route[v2][i] === State.route[v1][i1]){
                            flag = true
                            break
                        }
                    }
                    if(!flag){
                        let i2 = Math.floor(Math.random() * (State.route[v2].length - 2)) + 1
                        State.route[v2].splice(i2, 0, State.route[v1][i1])
                    }
                }else{
                    State.route[v2].splice(1, 0, State.route[v1][i1])
                }
                if(State.free[v2] >= State.y[v1][client1]){
                    State.y[v2][client1] += State.y[v1][client1]
                    State.free[v2] -= State.y[v1][client1]
                    State.free[v1] += State.y[v1][client1]
                    State.y[v1][client1] = 0
                    State.route[v1].splice(i1, 1)
                }else{
                    State.y[v2][client1] += State.free[v2]
                    State.y[v1][client1] -= State.free[v2]
                    State.free[v1] += State.free[v2]
                    State.free[v2] = 0
                }
            }
        }

        return State
    }

    function GetNewState(State, transport, clients, probability){
        let y = [] //количество груза, доставляемого ТС клиентам
        let route = [] //последовательность клиентов (маршрут) для каждого ТС
        let free = [] //
        for(let v = 0; v < transport.length; ++v){
            y.push([])
            route.push([])
            free.push(State.free[v])
            for(let i = 0; i < clients.length; ++i){
                y[v].push(State.y[v][i])
            }
            for(let r = 0; r < State.route[v].length; ++r){
                route[v].push(State.route[v][r])
            }
        }

        let State_new = {
            y: y,
            route: route,
            free: free
        }
        
        if(probability >= Math.random()){
            State_new = CustomerExchange(State_new, transport) //производим обмен клиентами между ТС
        }else{
            State_new = CustomerTransfer(State_new, transport) //производим передачу клиента другому ТС
        }

        return State_new
    }

    function CheckingRestrictions(State, transport, clients){
        for(let v = 0; v < transport.length; ++v){
            let Q = 0;
            for(let i = 0; i < clients.length; ++i){
                Q += State.y[v][i]
            }
            if(Q > transport[v].tonage){
                console.log("Ограничение грузоподъемности сработало")
                return true
            }
        }

        for(let i = 0; i < clients.length; ++i){
            let q = 0;
            for(let v = 0; v < transport.length; ++v){
                q += State.y[v][i]
            }
            if(q !== clients[i]){
                console.log("Ограничение спроса сработало")
                return true
            }
        }

        return false
    }

    function GetTransitionProbability(delta_StateCost, temperature){
        if(delta_StateCost <= 0){
            return 1
        }else{
            return Math.exp(-delta_StateCost/temperature)
        }
    }

    function GetTemperatureCauchy(max_temperature, i){
        return max_temperature/(1 + i)
    }

    this.addEventListener('message', event => { 
        if (!event) return;
        
        const max_temperature = event.data.max_temperature
        const min_temperature = event.data.min_temperature
        const shortest_distance_matrix = event.data.shortest_distance_matrix
        const clients = event.data.clients
        const transport = event.data.transport
        
        let State_best = null
        let State_new = null

        let i = 1
        let temperature = max_temperature

        console.log("Алгоритм №1")

        let start = new Date().getTime();

        State_best = GetInitialState(transport, clients)
        if(State_best === null){
            postMessage(null)
            return;
        }
        console.log("Начальное решение: ", State_best)
        let StateCost = GetStateCost(State_best, transport, shortest_distance_matrix)
        console.log("Начальная цена: ", StateCost)


        while(temperature > min_temperature){
            do{
                State_new = GetNewState(State_best, transport, clients, 0.5)
            }while(CheckingRestrictions(State_new, transport, clients))

            let StateCost_new = GetStateCost(State_new, transport, shortest_distance_matrix)
            let delta_StateCost = StateCost_new - StateCost

            if(GetTransitionProbability(delta_StateCost, temperature) >= Math.random()){
                State_best = State_new
                StateCost = StateCost_new
            }
            temperature = GetTemperatureCauchy(max_temperature, i)
            i += 1
        }

        let routes_distance = []
        let fuel_quantity = []
        for(let v = 0; v < transport.length; ++v){
            routes_distance.push(0)
            fuel_quantity.push(0)
            for(let r = 0; r < State_best.route[v].length - 1; ++r){
                routes_distance[v] = routes_distance[v] + shortest_distance_matrix[State_best.route[v][r]][State_best.route[v][r + 1]]
            }
            fuel_quantity[v] = fuel_quantity[v] + routes_distance[v] * transport[v].fuel_consumption
        }

        let elapsed = new Date().getTime() - start;

        console.log("Конечное решение: ", State_best)
        console.log("Конечная цена: ", StateCost)

        postMessage({route: State_best.route, y: State_best.y, free: State_best.free, StateCost: StateCost, routes_distance: routes_distance, fuel_quantity: fuel_quantity, runningTime: elapsed});
    })
}

export default RoutingWorker;