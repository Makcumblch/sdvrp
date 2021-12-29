import React from 'react'

export const Depo = ({depo, setDepo, SearchByAddressDepo, MoveToCoordinates, DeleteDepo}) => {


    return(
        <div className="blok">
          <h3>Депо</h3>
          <div className="flex">
              <p className="margin_label">Адрес:</p>
              <input className="input_address" type="text" 
                  placeholder="Укажите адрес депо"
                  value={depo.address}
                  onKeyPress={(event) => {
                    if(event.code === "Enter"){
                        SearchByAddressDepo(depo.address)
                    }
                  }}
                  onChange={(event) => setDepo({...depo, address: event.target.value})}
              >
              </input>
              <button className="fa fa-search" onClick={() => SearchByAddressDepo(depo.address)}></button>
              <button className="fa fa-location-arrow" onClick={() => MoveToCoordinates(depo)}></button>
              <button className="fa fa-times" onClick={() => DeleteDepo()}></button>
          </div>
        </div>
    )
}