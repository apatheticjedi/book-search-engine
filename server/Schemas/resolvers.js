const { AuthenticationError } = require('apollo-server-express');
const { signToken } = require('../utils/auth');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (_parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({ _id: context.user._id })
                    .select('-__v -password')

                return userData;
            }

            throw new AuthenticationError('Not logged in');
        },
    },
    Mutation: {
        addUser: async (parent, args) => {
            const user = User.create(args);
            const token = signToken(user);

            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);
            return { token, user };
        },
        saveBook: async (_parent, args, context) => {
            if (context.user) {

                const updatedBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args } },
                    { new: true }
                );

                return updatedBook;
            }
            throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, args, context) => {
            if (context.user) {

                const removeBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: args } },
                    { new: true }
                );

                return removeBook;
            }

            throw new AuthenticationError("Couldn't find user with this id!");
        }
    }
};


module.exports = resolvers;