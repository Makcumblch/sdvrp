import React from 'react'

export const ClientItem = ({client, index, DeleteClient, MoveToCoordinates, SearchByAddressClient, UpdateClient}) => {


    return(
        <div className="blok plus">
            <h3>{client.name}</h3>
            <div className="flex">
                <p className="margin_label">Адрес:</p>
                    <input style={{width: 203}} type="text" 
                        placeholder="Укажите адрес клиента"
                        value={client.address}
                        onKeyPress={(event) => {
                            if(event.code === "Enter"){
                                SearchByAddressClient(client.address, index)
                            }
                        }}
                        onChange={(event) => UpdateClient(index, {...client, address: event.target.value})}
                    >
                    </input>             
                    <button className="fa fa-search" onClick={() => SearchByAddressClient(client.address, index)}></button>
                    <button className="fa fa-location-arrow" onClick={() => MoveToCoordinates(client)}></button>
                    <button className="fa fa-times" onClick={() => DeleteClient(index)}></button>      
            </div>
            <div className="flex" style={{marginTop: 3}}>
                <p className="margin_label">Спрос:</p>
                    <input type="number" value={client.demand} min="1" 
                        onChange={(event)=> UpdateClient(index, {...client, demand: event.target.value.replace(/[^0-9]/g, '')})}
                        onBlur={() => {
                            if(client.demand === "" || client.demand[0] === "0"){
                                UpdateClient(index, {...client, demand:"1"})
                            }
                        }}
                    >
                    </input>
            </div>
       </div>
    )
}