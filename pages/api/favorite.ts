import { NextApiRequest, NextApiResponse } from 'next';
import { without } from 'lodash';

import prismadb from '../../lib/prismadb';
import serverAuth from '../../lib/serverAuth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

    // Add a movie on the Fav List
    try {
        if (req.method == 'POST') {
            const { currentUser } = await serverAuth(req);

            const { movieId } = req.body;

            const existingMovie = await prismadb.movie.findUnique({
                where: {
                    id: movieId,
                }
            });

            if (!existingMovie) {
                throw new Error('Invalid ID');
            }

            const user = await prismadb.user.update({
                where: {
                    email: currentUser.email || '',
                },
                data: {
                    favoriteIds: {
                        push: movieId,
                    }
                }
            });

            return void res.status(200).json(user);
        }

        // Remove the user from the fave List

        if (req.method === 'DELETE') {
            const { currentUser } = await serverAuth(req);

            const { movieId } = req.body;

            const existingMovie = await prismadb.movie.findUnique({
                where: {
                    id: movieId,
                }
            });

            if (!existingMovie) {
                throw new Error('Invalid ID');
            }

            const updatedFavoriteIds = without(currentUser.favoriteIds, movieId);

            const updatedUser = await prismadb.user.update({
                where: {
                    email: currentUser.email || '',
                },
                data: {
                    favoriteIds: updatedFavoriteIds,
                }
            }); 

            return void res.status(200).json(updatedUser);
        }

        // Catch all if the req method is not POST or DELETE
        return void res.status(405).end();
        
    } catch (error) {
        console.log(error)
        return void res.status(400).end();
    }
    
}