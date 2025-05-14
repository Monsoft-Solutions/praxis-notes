import { ReactElement } from 'react';
import { Route } from '@routes/_private/_app/route';
import { langMap } from '@shared/utils/language-code-to-name.util';
import { UserLang } from '@auth/enum/user-lang.enum';

export function UserInformation(): ReactElement {
    const { loggedInUser } = Route.useRouteContext();

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-muted-foreground text-sm">Name</p>
                    <p className="font-medium">
                        {loggedInUser.name} {loggedInUser.lastName}
                    </p>
                </div>

                <div>
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p className="font-medium">{loggedInUser.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-muted-foreground text-sm">Language</p>
                    <p className="text-muted-foreground font-medium">
                        {langMap(loggedInUser.language as UserLang)}
                    </p>
                </div>
                <div>
                    <p className="text-muted-foreground text-sm">
                        Member Since
                    </p>
                    <p className="font-medium">
                        {new Date(loggedInUser.createdAt).toLocaleDateString()}
                    </p>
                </div>
            </div>
        </div>
    );
}
