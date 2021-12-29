import React from 'react'

import { ClientItem } from './ClientItem';
import { TransportItem } from './TransportItem';

export const Tabs = ({clients, AddClient, DeleteClient, UpdateClient, SearchByAddressClient, MoveToCoordinates, transport, AddTransport, DeleteTransport, UpdateTransport}) => {

    return(
        <div className="tabs">
            <input type="radio" name="tabs" id="tab-first" defaultChecked ></input>
            <label htmlFor="tab-first">
                <h3>Клиенты</h3>
            </label>
            
            <input type="radio" name="tabs" id="tab-second"></input>
            <label htmlFor="tab-second">
                <h3>Транспорт</h3>
            </label>
            
            <div id="tab-content-1" className="tab-content">
                <div className='flex blok plus'>
                    <p className="margin_label">Добавить клиента</p>
                    <button className="fa fa-plus" onClick={() => AddClient()}></button>
                </div>
                <div>
                    {clients.length === 0 ? <h3 style={{textAlign: "center", marginTop: 5}}>Список клиентов пуст</h3> :
                    <>
                    {clients.map((element, index) => {
                        return <ClientItem key={index}
                        client={element}
                        index={index} 
                        DeleteClient={DeleteClient} 
                        MoveToCoordinates={MoveToCoordinates}
                        SearchByAddressClient={SearchByAddressClient}
                        UpdateClient={UpdateClient}
                        />
                    })}
                    </>
                    }
                </div>
            </div>
            <div id="tab-content-2" className="tab-content">
                <div className='flex blok plus'>
                    <p className="margin_label">Добавить транспорт</p>
                    <button className="fa fa-plus" onClick={() => AddTransport()}></button>
                </div>
                <div>
                    {transport.length === 0 ? <h3 style={{textAlign: "center", marginTop: 5}}>Список транспорта пуст</h3> :
                    <>
                    {transport.map((element, index) => {
                        return <TransportItem key={index}
                            transport={element}
                            index={index}
                            DeleteTransport={DeleteTransport}
                            UpdateTransport={UpdateTransport}
                        />
                    })}
                    </>
                    }
                </div>
            </div> 
        </div>             
    )
}