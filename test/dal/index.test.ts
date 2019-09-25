const allSpy = jest.fn().mockReturnValue(Promise.resolve(undefined));
const spreadSpy = jest.fn();

jest.mock('axios', () => {
    return {
        default: {
            all: allSpy,
            spread: spreadSpy
        }
    }
});


import * as dal from "../../src/dal";

describe('dal Index', () => {
    describe('When calling concurrent requests', () => {
        it('it should call them using axios', async () => {
            await dal.parallel(
                // dal.getUser(1),
                // dal.getCoupons(10),
            );

            expect(allSpy).toHaveBeenCalled();
        });

        describe('When it axios throws an error', () => {
            it('it should throw a formatted error', async () => {
                allSpy.mockRejectedValue(undefined);
                await expect(dal.parallel(
                    // dal.getUser(1),
                    // dal.getCoupons(10),
                )).rejects.toThrow();
            });
        });

    });
});
