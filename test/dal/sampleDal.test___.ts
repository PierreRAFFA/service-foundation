// import * as httpClient from "../../src/dal/httpClient";
// import * as appMicroservices from "../../src/app/appMicroservices";
//
// import { ICoupon, IMicroservice, IProperty, IReferral } from "../../src/interfaces";
// import { Microservices } from "../../src/constants";
//
// const microservice: IMicroservice = {
//     name: Microservices.LfsDb,
//     url: 'ms-properties-db-url',
//     authKey: 'ms-properties-db-auth-key'
// };
//
// const requestSpy = jest.spyOn(httpClient, 'request');
// jest.spyOn(appMicroservices, 'getMicroservice').mockImplementation(() => {
//     return microservice;
// });
//
// import * as dal from "../../src/dal";
// import { AxiosPromise } from "axios";
//
// describe('propertyDal', () => {
//     describe('When getting the property', () => {
//         it('it should call the httpClient with the correct config', async () => {
//             requestSpy.mockReset();
//             await dal.getProperty(3, {"select": "id" });
//             expect(requestSpy).toHaveBeenLastCalledWith({
//                 "baseURL": "ms-properties-db-url",
//                 "headers": {"auth-key": "ms-properties-db-auth-key"},
//                 "method": "get",
//                 "params": {"select": "id"},
//                 "url": `/properties/3`
//             })
//         });
//
//         it('it should return the data', async () => {
//             requestSpy.mockReset();
//             requestSpy.mockReturnValue(Promise.resolve({
//                 data: {
//                     data: [{
//                         id: 3
//                     }]
//                 }
//             }) as AxiosPromise);
//             const response: IProperty = await dal.getProperty(3);
//             expect(response).toEqual([{
//                 "id": 3,
//             }])
//         });
//     });
// });
