import UserModel from '@/model/user';
import { getServerSession } from 'next-auth/next';
import dbConnect from '@/lib/dbConnect';
import { User } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import mongoose from 'mongoose'; // Import mongoose

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  const messageId = params.messageid;
  await dbConnect();
  const session = await getServerSession(authOptions);
  const _user: User = session?.user;

  if (!session || !_user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  try {
    // ✅ Convert the string ID to a MongoDB ObjectId
    const objectId = new mongoose.Types.ObjectId(messageId);

    const updateResult = await UserModel.updateOne(
      { _id: _user._id },
      { $pull: { messages: { _id: objectId } } } // Use the ObjectId in the query
    );

    if (updateResult.modifiedCount === 0) {
      return Response.json(
        { message: 'Message not found or already deleted', success: false },
        { status: 404 }
      );
    }

    return Response.json(
      { message: 'Message deleted', success: true },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    // Add a check for invalid ObjectId format
    if (error instanceof mongoose.Error.CastError) {
      return Response.json(
        { message: 'Invalid message ID format', success: false },
        { status: 400 }
      );
    }
    return Response.json(
      { message: 'Error deleting message', success: false },
      { status: 500 }
    );
  }
}