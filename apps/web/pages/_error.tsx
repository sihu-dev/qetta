import { NextPageContext } from 'next';

interface ErrorProps {
  statusCode: number;
}

function Error({ statusCode }: ErrorProps) {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{statusCode}</h1>
        <p className="mt-2 text-gray-600">
          {statusCode === 404 ? 'Page not found' : 'An error occurred'}
        </p>
      </div>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? (err.statusCode ?? 500) : 404;
  return { statusCode };
};

export default Error;
