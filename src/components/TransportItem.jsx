import React from 'react'

export const TransportItem = ({transport, index, DeleteTransport, UpdateTransport}) => {


    return(
        <div className="blok plus">
            <div className="flex">
                <h3 style={{marginRight: 10}}>{transport.name}</h3>
                <button style={{marginTop: 3}} className="fa fa-times" onClick={() => DeleteTransport(index)}></button>
            </div>
            <div className="flex" style={{marginTop: 3}}>
                <p className="margin_label">Грузоподъемность:</p>
                <input style={{width: 203}} type="number"
                    value={transport.tonage}
                    onChange={(event) => UpdateTransport(index, {...transport, tonage: event.target.value.replace(/[^0-9]/g, '')})}
                    onBlur={() => {
                        if(transport.tonage === "" || transport.tonage[0] === "0"){
                            UpdateTransport(index, {...transport, tonage: "1"})
                        }
                    }}
                >
                </input>
            </div>
            <div className="flex" style={{marginTop: 3}}>
                <p className="margin_label">Расход топлива(л/100км):</p>
                <input style={{width: 160}} type="number" min="1"
                    value={transport.fuel_consumption}
                    onChange={(event) => UpdateTransport(index, {...transport, fuel_consumption: event.target.value.replace(/[^0-9]/g, '')})}
                    onBlur={() => {
                        if(transport.fuel_consumption === "" || transport.fuel_consumption[0] === "0"){
                            UpdateTransport(index, {...transport, fuel_consumption: "1"})
                        }
                    }}
                >
                </input> 
            </div>
       </div>
    )
}