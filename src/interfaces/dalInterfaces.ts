/**********************************************
 *
 *
 *
 *
 * These interfaces should reflect to the db
 * services
 *
 *
 *
 *
 **********************************************/
export interface IDalSearchParams {
    relation?: string;
    select?: string;
    sender_id?: string;
    limit?: number;
    orderBy?: string;
}

export interface IDalErrorResponse {
    response: {
        data: {
            message: string;
            status_code: string;
        }
        status: string;
        statusText: string;
    };
}
