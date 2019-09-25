// import { AxiosRequestConfig, AxiosResponse } from "axios";
// import * as httpClient from "./httpClient";
// import { get } from 'lodash';
// import { getMicroservice } from "../app/appMicroservices";
// import { Microservices } from "../constants";
// import { IDalSearchParams, IProperty } from "../interfaces";
//
// /**
//  * Microservice involved to the requests
//  */
// const msName: Microservices = Microservices.PropertiesDb;
//
// /**
//  * Returns the default config based on the ms information
//  */
// const defaultAxiosConfig = (): AxiosRequestConfig => {
//     return {
//         baseURL: getMicroservice(msName).url,
//         headers: {
//             'auth-key': getMicroservice(msName).authKey,
//         }
//     };
// };
//
// //////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////  GET
// /**
//  * Returns the coupon assigned to the user
//  *
//  * @param id
//  * @param queryParams
//  */
// export async function getProperty(id: number, queryParams: IDalSearchParams = {}): Promise<IProperty> {
//     const config: AxiosRequestConfig = {
//         ...defaultAxiosConfig(),
//         method: 'get',
//         url: `/properties/${id}`,
//         params: {...queryParams}
//     };
//     const result: AxiosResponse<IProperty> = await httpClient.request(config);
//     return get(result, 'data.data');
// }
// //////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////  POST
//
// //////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////  PUT
// /**
//  * @TODO
//  *
//  * @param id
//  * @param model
//  * @param queryParams
//  */
// // export async function updateProperty(id: number, model: any, queryParams: IDalSearchParams = {}): Promise<IProperty> {
// //     return Promise.resolve(undefined);
// // }
//
// //////////////////////////////////////////////////////////////////////////////////////////
// ///////////////////////////////////////////////////////////////////////////////  DELETE
