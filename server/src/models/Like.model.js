import mongoose from 'mongoose';

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetType: {
      type: String,
      enum: ['Post', 'Comment'],
      default: 'Post'
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
      index: true
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      index: true
    }
  },
  {
    timestamps: true
  }
);

likeSchema.index(
  { user: 1, post: 1 },
  { unique: true, partialFilterExpression: { post: { $exists: true, $ne: null } } }
);

likeSchema.index(
  { user: 1, comment: 1 },
  { unique: true, partialFilterExpression: { comment: { $exists: true, $ne: null } } }
);

const Like = mongoose.model('Like', likeSchema);
export default Like;
