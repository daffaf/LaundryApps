'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ICustomerAddressData } from "@/type/address"
import React from "react"

interface SelectAddress {
    onValueChange : any
    name : string
    placeholder: string
    option : ICustomerAddressData[]

}
export const SelectAddress: React.FC<SelectAddress> = ({
    onValueChange,
    name,
    placeholder,
    option
}) => {
    return(
       <Select onValueChange={onValueChange} name={name}>
            <SelectTrigger>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {option.map((data, index) => (
                <SelectItem key={index} value={data.addressId.toString()}>
                  <p
                    className={`${data.isPrimary === true ? 'font-semibold' : ''}`}
                  >
                    {`${data.detailAddress}, kec.${data.kecamatan},${data.kota}, ${data.provinsi} ${data.isPrimary === true ? '(Alamat Utama)' : ''}`}
                  </p>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
    )
}